import * as React from 'react';
import { useMockServer } from '@mui/x-data-grid-generator';
import { createRenderer, waitFor, fireEvent, within, act, screen } from '@mui/internal-test-utils';
import { expect } from 'chai';
import {
  DataGridPro,
  DataGridProProps,
  GRID_ROOT_GROUP_ID,
  GridApi,
  GridDataSource,
  GridGetRowsParams,
  GridGroupNode,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import { SinonSpy, spy } from 'sinon';
import { raf } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const dataSetOptions = {
  dataSet: 'Employee' as const,
  rowLength: 100,
  maxColumns: 3,
  treeData: { maxDepth: 2, groupingField: 'name', averageChildren: 5 },
};
const pageSizeOptions = [5, 10, 50];

const serverOptions = { minDelay: 0, maxDelay: 0, verbose: false };

describe('<DataGridPro /> - Data source tree data', () => {
  const { render } = createRenderer();

  let apiRef: React.MutableRefObject<GridApi>;
  let fetchRowsSpy: SinonSpy;
  let mockServer: ReturnType<typeof useMockServer>;

  function TestDataSource(props: Partial<DataGridProProps> & { shouldRequestsFail?: boolean }) {
    apiRef = useGridApiRef();
    mockServer = useMockServer(dataSetOptions, serverOptions, props.shouldRequestsFail ?? false);
    fetchRowsSpy = spy(mockServer, 'fetchRows');
    const { fetchRows, columns } = mockServer;

    const dataSource: GridDataSource = React.useMemo(
      () => ({
        getRows: async (params: GridGetRowsParams) => {
          const urlParams = new URLSearchParams({
            paginationModel: JSON.stringify(params.paginationModel),
            filterModel: JSON.stringify(params.filterModel),
            sortModel: JSON.stringify(params.sortModel),
            groupKeys: JSON.stringify(params.groupKeys),
          });

          const getRowsResponse = await fetchRows(
            `https://mui.com/x/api/data-grid?${urlParams.toString()}`,
          );

          return {
            rows: getRowsResponse.rows,
            rowCount: getRowsResponse.rowCount,
          };
        },
        getGroupKey: (row) => row[dataSetOptions.treeData.groupingField],
        getChildrenCount: (row) => row.descendantCount,
      }),
      [fetchRows],
    );

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro
          apiRef={apiRef}
          columns={columns}
          unstable_dataSource={dataSource}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 }, rowCount: 0 } }}
          pagination
          treeData
          pageSizeOptions={pageSizeOptions}
          disableVirtualization
          {...props}
        />
      </div>
    );
  }

  beforeEach(function beforeTest() {
    if (isJSDOM) {
      this.skip(); // Needs layout
    }
  });

  it('should fetch the data on initial render', async () => {
    render(<TestDataSource />);
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });
  });

  it('should re-fetch the data on filter change', async () => {
    const { setProps } = render(<TestDataSource />);
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });
    setProps({ filterModel: { items: [{ field: 'name', value: 'John', operator: 'contains' }] } });
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(2);
    });
  });

  it('should re-fetch the data on sort change', async () => {
    const { setProps } = render(<TestDataSource />);
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });
    setProps({ sortModel: [{ field: 'name', sort: 'asc' }] });
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(2);
    });
  });

  it('should re-fetch the data on pagination change', async () => {
    const { setProps } = render(<TestDataSource />);
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });
    setProps({ paginationModel: { page: 1, pageSize: 10 } });
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(2);
    });
  });

  it('should fetch nested data when clicking on a dropdown', async () => {
    render(<TestDataSource />);

    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });
    await raf();
    expect(Object.keys(apiRef.current.state.rows.tree).length).to.equal(10 + 1);
    const dataRow1 = await screen.findByText((_, el) => el?.getAttribute('data-rowindex') === '0');

    const cell11 = within(dataRow1).getAllByRole('gridcell')[0];
    fireEvent.click(within(cell11).getByRole('button'));
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(2);
    });

    const cell11ChildrenCount = Number(cell11.innerText.split('(')[1].split(')')[0]);
    expect(Object.keys(apiRef.current.state.rows.tree).length).to.equal(
      10 + 1 + cell11ChildrenCount,
    );
  });

  it('should fetch nested data when calling API method `unstable_dataSource.fetchRows`', async () => {
    render(<TestDataSource />);

    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });
    await raf();

    const tree = apiRef.current.state.rows.tree;
    expect(Object.keys(tree).length).to.equal(10 + 1);
    const dataRow1 = await screen.findByText((_, el) => el?.getAttribute('data-rowindex') === '0');

    const cell11 = within(dataRow1).getAllByRole('gridcell')[0];
    const firstChildId = (tree[GRID_ROOT_GROUP_ID] as GridGroupNode).children[0];
    act(() => {
      apiRef.current.unstable_dataSource.fetchRows(firstChildId);
    });
    await raf();

    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(2);
    });

    const cell11ChildrenCount = Number(cell11.innerText.split('(')[1].split(')')[0]);
    expect(Object.keys(apiRef.current.state.rows.tree).length).to.equal(
      10 + 1 + cell11ChildrenCount,
    );
  });

  it('should lazily fetch nested data when using `defaultGroupingExpansionDepth`', async () => {
    render(<TestDataSource defaultGroupingExpansionDepth={1} />);

    // Initial fetch
    await waitFor(() => {
      expect(fetchRowsSpy.callCount).to.equal(1);
    });

    const groupsToFetch = apiRef.current.state.rows.groupsToFetch;
    expect(groupsToFetch?.length).to.be.greaterThan(0);

    const tree = apiRef.current.state.rows.tree;

    // All the group nodes belonging to the grid root group should be there for fetching
    (tree[GRID_ROOT_GROUP_ID] as GridGroupNode).children.forEach((child) => {
      const node = tree[child];
      if (node.type === 'group') {
        expect(groupsToFetch).to.include(child);
      }
    });
  });
});
