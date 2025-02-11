import { renderHook } from '@mui/internal-test-utils';
import { expect } from 'chai';
import * as React from 'react';
import { useBarSeries } from './useBarSeries';
import { BarSeriesType } from '../models';
import { BarChart } from '../BarChart';

describe('useBarSeries', () => {
  const mockSeries: BarSeriesType[] = [
    {
      type: 'bar',
      id: '1',
      data: [1, 2, 3],
    },
    {
      type: 'bar',
      id: '2',
      data: [4, 5, 6],
    },
  ];

  const defaultProps = {
    series: mockSeries,
    height: 400,
    width: 400,
  };

  const options: any = {
    wrapper: ({ children }: { children: React.ReactElement }) => {
      return <BarChart {...defaultProps}>{children}</BarChart>;
    },
  };

  it('should return all bar series when no seriesIds are provided', () => {
    const { result } = renderHook(() => useBarSeries(), options);
    expect(result.current?.seriesOrder).to.deep.equal(['1', '2']);
    expect(Object.keys(result.current?.series ?? {})).to.deep.equal(['1', '2']);
  });

  it('should return the specific bar series when a single seriesId is provided', () => {
    const { result } = renderHook(() => useBarSeries('1'), options);
    expect(result.current?.id).to.deep.equal(mockSeries[0].id);
  });

  it('should return the specific bar series when multiple seriesIds are provided', () => {
    const { result } = renderHook(() => useBarSeries(['2', '1']), options);
    expect(result.current?.map((v) => v?.id)).to.deep.equal([mockSeries[1].id, mockSeries[0].id]);
  });

  it('should return undefined series when invalid seriesIds are provided', () => {
    const { result } = renderHook(() => useBarSeries(['1', '3']), options);
    expect(result.current?.map((v) => v?.id)).to.deep.equal([mockSeries[0].id, undefined]);
  });
});
