import * as d3 from 'd3';

export interface BarChartOptions {
  width: number;
  mapData: any;
  barHeight: number;
  year: number;
}

export class BarChart {
  public dataBar = [];
  private chartNode: Element;
  private $chart;
  private active;
  private options: BarChartOptions;
  private g;
  private height: number;

  constructor(node: Element, options: BarChartOptions, activeRegion?: string) {
    this.options = options;
    this.chartNode = node;
    this.dataBar = this.options.mapData
      .map((item) => {
        return {
          name: item.name,
          region: item.region,
          data: item.data[this.options.year]
        };
      })
      .sort((a, b) => a.data.death > b.data.death ? -1 : a.data.death < b.data.death ? 1 : 0);
    this.init(activeRegion);
  }

  public selectRegion(region: string) {
    this.g
      .selectAll('rect')
      .classed('main-category-bar', (d) => region && d.region === region);
  }

  public updateData(options: BarChartOptions, activeRegion?: string) {
    this.dataBar = this.options.mapData
      .map((item) => {
        return {
          name: item.name,
          region: item.region,
          data: item.data[options.year]
        };
      })
      .sort((a, b) => a.data.death > b.data.death ? -1 : a.data.death < b.data.death ? 1 : 0);
    this.g.remove();
    this.init(activeRegion);
  }

  private init(activeRegion?: string) {
    this.height = (this.options.barHeight + 4) * (this.dataBar.length - 1);
    this.active = d3.select(null);
    this.$chart = d3.select(this.chartNode)
      .attr('width', this.options.width)
      .attr('height', this.height)
      .attr('class', 'bar-chart')
      .on('click', this.stopped, true);

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.dataBar.map((item) => item.data.death))])
      .range([0, this.options.width - 30]);

    const y = d3.scaleBand()
      .domain(this.dataBar.map((item) => item.name))
      .rangeRound([0, (this.options.barHeight + 4) * (this.dataBar.length - 1)])
      .padding(0.1);

    const xAxis = d3.axisTop()
      .scale(x);

    this.g = this.$chart.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(10, 0)`);

    this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, 30)')
      .call(xAxis);

    this.g.selectAll('.tick').append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', (this.options.barHeight + 4) * (this.dataBar.length - 1));

    this.g.selectAll('rect')
      .data(this.dataBar)
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.name) + 10)
      .attr('name', (d) => d.name)
      .attr('width', (d) => x(d.data.death))
      .attr('height', this.options.barHeight)
      .style('fill', (d) => `rgba(109, 184, 255, ${d.data.death / 100})`)
      .classed('main-category-bar', (d) => activeRegion && d.region === activeRegion);

    this.g.selectAll('text.score')
      .data(this.dataBar)
      .enter().append('text')
      .attr('x', (d) => x(d.data.death))
      .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
      .attr('dx', -5)
      .attr('dy', '.9rem')
      .attr('text-anchor', 'end')
      .attr('class', 'score')
      .text((d) => `${d.data.death} age`);

    this.g.selectAll('text.name')
      .data(this.dataBar)
      .enter().append('text')
      .attr('x', 10)
      .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '.9rem')
      .text((d) => d.name);
  }

  private stopped() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }
}
