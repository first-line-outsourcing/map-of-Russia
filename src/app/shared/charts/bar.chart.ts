import * as d3 from 'd3';
import { randomNumber } from '../helper';

export interface BarChartOptions {
  width: number;
  mapData: string;
  barHeight: number;
}

export class BarChart {
  public dataBar = [];
  private chartNode: Element;
  private $chart;
  private active;
  private options: BarChartOptions;
  private g;
  private height: number;

  constructor(node: Element, options: BarChartOptions) {
    this.options = options;
    this.chartNode = node;
    d3.json(this.options.mapData, (data) => {
      data.regions.forEach((item) => this.dataBar.push({
        name: item.name,
        region: item.region,
        death: randomNumber(50, 100)
      }));
      this.dataBar = this.dataBar.sort((a, b) => a.death > b.death ? -1 : a.death < b.death ? 1 : 0);
      this.init();
    });
  }

  public selectRegion(region: string) {
    this.g
      .selectAll('rect')
      .classed('main-category-bar', (d) => region && d.region === region);
  }

  public updateData() {
    this.dataBar.forEach((item) => item.death = randomNumber(50, 100));
    this.dataBar = this.dataBar.sort((a, b) => a.death > b.death ? -1 : a.death < b.death ? 1 : 0);
    this.g.remove();
    this.init();
  }

  private init() {
    this.height = (this.options.barHeight + 4) * (this.dataBar.length - 1);
    this.active = d3.select(null);
    this.$chart = d3.select(this.chartNode)
      .attr('width', this.options.width)
      .attr('height', this.height)
      .attr('class', 'bar-chart')
      .on('click', this.stopped, true);

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.dataBar.map((item) => item.death))])
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
      .attr('width', (d) => x(d.death))
      .attr('height', this.options.barHeight)
      .style('fill', (d) => `rgba(109, 184, 255, ${d.death / 100})`);

    this.g.selectAll('text.score')
      .data(this.dataBar)
      .enter().append('text')
      .attr('x', (d) => x(d.death))
      .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
      .attr('dx', -5)
      .attr('dy', '.9rem')
      .attr('text-anchor', 'end')
      .attr('class', 'score')
      .text((d) => `${d.death} age`);

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
