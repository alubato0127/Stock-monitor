import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Dataset } from '../data/types'
import { holdingsMap } from '../data/analytics'

export function AnalysisView({ ds, dark }: { ds: Dataset; dark: boolean }) {
  const axis = dark ? '#9ca3af' : '#6b7280'
  const split = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const { dates, aum, nh, top10, hhi } = useMemo(() => {
    const dates = ds.fund_series.map((d) => d.date)
    const aum = ds.fund_series.map((d) => +(d.nav_total / 1e8).toFixed(1))
    const nh = ds.fund_series.map((d) => d.n_holdings)
    const top10: number[] = []
    const hhi: number[] = []
    for (const d of dates) {
      const w = [...holdingsMap(ds, d).values()].map((h) => h.weight).sort((a, b) => b - a)
      top10.push(+w.slice(0, 10).reduce((s, x) => s + x, 0).toFixed(1))
      hhi.push(Math.round(w.reduce((s, x) => s + x * x, 0)))
    }
    return { dates, aum, nh, top10, hhi }
  }, [ds])

  const aumOption = {
    grid: { left: 60, right: 55, top: 34, bottom: 55 },
    tooltip: { trigger: 'axis' },
    legend: { data: ['規模(億)', '持股檔數'], textStyle: { color: axis }, top: 4 },
    xAxis: { type: 'category', data: dates, axisLabel: { color: axis }, axisLine: { lineStyle: { color: split } } },
    yAxis: [
      { type: 'value', name: '億', nameTextStyle: { color: axis }, axisLabel: { color: axis }, splitLine: { lineStyle: { color: split } } },
      { type: 'value', name: '檔', position: 'right', nameTextStyle: { color: axis }, axisLabel: { color: axis }, splitLine: { show: false } },
    ],
    dataZoom: [{ type: 'inside' }, { type: 'slider', height: 16, bottom: 14 }],
    series: [
      { name: '規模(億)', type: 'line', smooth: true, showSymbol: false, areaStyle: { opacity: 0.08 }, data: aum, lineStyle: { color: '#6366f1' }, itemStyle: { color: '#6366f1' } },
      { name: '持股檔數', type: 'line', yAxisIndex: 1, step: 'end', showSymbol: false, data: nh, lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' } },
    ],
  }

  const concOption = {
    grid: { left: 55, right: 55, top: 34, bottom: 55 },
    tooltip: { trigger: 'axis' },
    legend: { data: ['前10大權重(%)', 'HHI'], textStyle: { color: axis }, top: 4 },
    xAxis: { type: 'category', data: dates, axisLabel: { color: axis }, axisLine: { lineStyle: { color: split } } },
    yAxis: [
      { type: 'value', name: '%', nameTextStyle: { color: axis }, axisLabel: { color: axis }, splitLine: { lineStyle: { color: split } } },
      { type: 'value', name: 'HHI', position: 'right', nameTextStyle: { color: axis }, axisLabel: { color: axis }, splitLine: { show: false } },
    ],
    dataZoom: [{ type: 'inside' }, { type: 'slider', height: 16, bottom: 14 }],
    series: [
      { name: '前10大權重(%)', type: 'line', smooth: true, showSymbol: false, data: top10, lineStyle: { color: '#f59e0b' }, itemStyle: { color: '#f59e0b' } },
      { name: 'HHI', type: 'line', yAxisIndex: 1, smooth: true, showSymbol: false, data: hhi, lineStyle: { color: '#ef4444' }, itemStyle: { color: '#ef4444' } },
    ],
  }

  return (
    <div className="space-y-4">
      <Panel title="基金規模 ＆ 持股檔數 走勢">
        <ReactECharts option={aumOption} style={{ height: 300 }} notMerge />
      </Panel>
      <Panel title="集中度走勢（前10大權重 ＆ HHI）">
        <ReactECharts option={concOption} style={{ height: 300 }} notMerge />
      </Panel>
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Phase 2 規劃中</div>
        區間 diff（任選兩日完整加碼/減碼/進出清單）、區間買賣超排行、產業/類股分布變化、日期×個股變化熱力圖、新進/剔除事件時間軸。
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
      <div className="text-sm font-medium mb-2">{title}</div>
      {children}
    </div>
  )
}
