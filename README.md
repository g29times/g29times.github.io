# g29times.github.io
personal blog

## 图表方案
在你的 BlogPost.tsx 链路中，extractTableData 只是机械地把 <thead> 和 <tbody> 转成 JSON 数组。要让 BlogChart 知道该画什么，通常有三种工业级的“打标签”方案。

既然你现在能改代码，我建议你采用“标题协议法”，这是对 Markdown 侵入性最小、最直观的方案。

方案：在表头（Header）中埋入标识符
你可以约定：如果表头第一个单元格包含 (pie) 或 (bar)，则触发对应的图表类型。

1. 修改后的 Markdown 写法：
| 作品分类 (pie) | 数量 |
| :--- | :--- |
| 奇幻冒险 | 12 |
| 现实主义 | 8 |

| 年度作品分布 (bar) | 发布年份 |
| :--- | :--- |
| 风之谷 | 1984 |
| 天空之城 | 1986 |
2. 修改 BlogPost.tsx 中的逻辑：
你需要调整 replace 回调函数里的逻辑（大约在 #286-312 行附近）。

// 伪代码参考
const replace = (domNode) => {
  if (domNode.name === 'table') {
    const tableData = extractTableData(domNode);
    const firstHeader = tableData.headers[0] || '';

    // 1. 识别类型标识符
    let chartType = 'table'; // 默认还是表格
    if (firstHeader.includes('(pie)')) chartType = 'pie';
    if (firstHeader.includes('(bar)')) chartType = 'bar';

    // 2. 如果识别到了图表类型，返回 BlogChart 组件
    if (chartType !== 'table') {
      // 清理掉表头里的标识符，保持视觉干净
      const cleanHeaders = tableData.headers.map(h => h.replace(/\(.*\)/, '').trim());

      return (
        <BlogChart 
          type={chartType} 
          data={tableData.rows} 
          headers={cleanHeaders} 
          title={cleanHeaders[0]} 
        />
      );
    }

    // 3. 否则走原有的表格包装逻辑
    return <div className="table-wrapper"><table {...}>{domNode.children}</table></div>;
  }
}

全部图表
基础分布类
pie (饼图)
bar (柱状图)
line (折线图)
area (面积图)
比例与关联类
donut (环形图)
radar (雷达图/蛛网图)
scatter (散点图)
bubble (气泡图)
进阶/行业类
funnel (漏斗图 - 转化率)
gauge (仪表盘 - 进度)
heatmap (热力图)
treemap (矩形树图 - 层级占比)
candlestick (K线图/蜡烛图)
流程与逻辑类（若组件支持）
sankey (桑基图 - 能量/流量流向)
waterfall (瀑布图 - 增减变动)
