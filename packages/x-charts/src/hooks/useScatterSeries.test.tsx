import { renderHook } from '@mui/internal-test-utils';
import { expect } from 'chai';
import * as React from 'react';
import { useScatterSeries } from './useScatterSeries';
import { ScatterSeriesType } from '../models';
import { ScatterChart } from '../ScatterChart';

describe('useScatterSeries', () => {
  const mockSeries: ScatterSeriesType[] = [
    {
      type: 'scatter',
      id: '1',
      data: [
        { id: 1, x: 1, y: 1 },
        { id: 2, x: 2, y: 2 },
      ],
    },
    {
      type: 'scatter',
      id: '2',
      data: [
        { id: 3, x: 3, y: 3 },
        { id: 4, x: 4, y: 4 },
      ],
    },
  ];

  const defaultProps = {
    series: mockSeries,
    height: 400,
    width: 400,
  };

  const options: any = {
    wrapper: ({ children }: { children: React.ReactElement }) => {
      return <ScatterChart {...defaultProps}>{children}</ScatterChart>;
    },
  };

  it('should return all scatter series when no seriesIds are provided', () => {
    const { result } = renderHook(() => useScatterSeries(), options);
    expect(result.current?.seriesOrder).to.deep.equal(['1', '2']);
    expect(Object.keys(result.current?.series ?? {})).to.deep.equal(['1', '2']);
  });

  it('should return the specific scatter series when a single seriesId is provided', () => {
    const { result } = renderHook(() => useScatterSeries('1'), options);
    expect(result.current?.id).to.deep.equal(mockSeries[0].id);
  });

  it('should return the specific scatter series when multiple seriesIds are provided', () => {
    const { result } = renderHook(() => useScatterSeries(['2', '1']), options);
    expect(result.current?.map((v) => v?.id)).to.deep.equal([mockSeries[1].id, mockSeries[0].id]);
  });

  it('should return undefined series when invalid seriesIds are provided', () => {
    const { result } = renderHook(() => useScatterSeries(['1', '3']), options);
    expect(result.current?.map((v) => v?.id)).to.deep.equal([mockSeries[0].id, undefined]);
  });
});
