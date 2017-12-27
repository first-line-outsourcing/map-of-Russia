import { EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { randomNumber } from '../helper';

export interface ChordChartOptions {
  mapData: any;
  width: number;
  height: number;
}

export class ChordChart {
  public selectTrade = new EventEmitter<any>();
  private chartNode: Element;
  private options: ChordChartOptions;
  private g;
  private nameOfRegions = [];
  private matrix;
  private totalValues = 0;

  constructor(node: Element, options: ChordChartOptions) {
    this.options = options;
    this.chartNode = node;
    this.init();
  }

  public updateYear() {
    this.g.selectAll('g').remove();
    this.init();
  }

  private init() {

    const r1 = Math.min(this.options.width, this.options.height) * 0.5 - 40;
    const r0 = r1 - 110;
    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending);

    const arc = d3.arc()
      .innerRadius(r0)
      .outerRadius(r0 + 20);

    const ribbon = d3.ribbon()
      .radius(r0);

    const colors = d3.scaleOrdinal(d3.schemeCategory20c);

    this.calcMatrix(this.options.mapData);

    this.g = d3.select(this.chartNode)
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .append('g')
      .attr('transform', 'translate(' + this.options.width / 2 + ',' + this.options.height / 2 + ')')
      .datum(chord(this.matrix));

    const group = this.g.append('g')
      .attr('class', 'groups')
      .selectAll('g')
      .data((chords) => chords.groups)
      .enter().append('g');

    group.append('path')
      .on('mouseover', this.dimChords.bind(this))
      .on('mouseout', this.resetChords.bind(this))
      .style('fill', (d, i) => colors(i))
      .style('stroke', (d, i) => colors(i))
      .attr('d', arc);

    group
      .append('text')
      .each(function (d) {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr('dy', '.35em')
      .style('font-family', 'helvetica, arial, sans-serif')
      .style('font-size', '10px')
      .attr('text-anchor', (d) => d.angle > Math.PI ? 'end' : null)
      .attr('transform', (d) => {
        return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ')' +
          'translate(' + (r0 + 26) + ')' +
          (d.angle > Math.PI ? 'rotate(180)' : '');
      })
      .on('mouseover', this.dimChords.bind(this))
      .on('mouseout', this.resetChords.bind(this))
      .text((d) => this.nameOfRegions[d.index]);

    group.exit().transition().duration(1000)
      .style('opacity', 0).remove();

    this.g.append('g')
      .attr('class', 'ribbons')
      .selectAll('path')
      .data((chords) => chords)
      .enter().append('path')
      .on('mouseover', this.dimChords.bind(this))
      .on('mouseout', this.resetChords.bind(this))
      .transition().duration(2000)
      .attr('class', 'chord')
      .attr('d', ribbon)
      .style('fill', (d, i) => colors(i))
      .style('stroke', (d, i) => colors(i));
  }

  private resetChords() {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    this.g.selectAll('path.chord')
      .style('transition', 'opacity .5s')
      .style('opacity', 0.9);
    this.selectTrade.emit(null);
  }

  private dimChords(d) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    this.g.selectAll('path.chord')
      .style('opacity', (p) => {
        if (d.source) {
          if (p.source.index === d.source.index && p.target.index === d.target.index) {
            this.calcTrades(d);
            return 1;
          } else {
            return 0.2;
          }
        } else {
          return (p.source.index === d.index || p.target.index === d.index) ? 1 : 0.2;
        }
      });
  }

  private calcTrades(d) {
    const totalScoreSource = this.matrix[d.source.index].reduce((k, n) => k + n, 0);
    const totalScoreTarget = this.matrix[d.target.index].reduce((k, n) => k + n, 0);
    this.selectTrade.emit({
      source: {
        total: totalScoreSource,
        value: d.source.value,
        name: this.nameOfRegions[d.source.index]
      },
      target: {
        total: totalScoreTarget,
        value: d.target.value,
        name: this.nameOfRegions[d.target.index]
      },
      total: this.totalValues
    });
  }

  private calcMatrix(mapData) {
    const countRegions = 15;
    const startCountRegion = randomNumber(0, mapData.length - countRegions);
    const endCountRegion = startCountRegion + countRegions;
    this.totalValues = 0;
    this.matrix = Array.from({ length: endCountRegion - startCountRegion },
      () => Array.from({ length: endCountRegion - startCountRegion }, () => {
        const probability = 30;
        const value = randomNumber(0, 100) < probability ? randomNumber(50, 1000) : 0;
        this.totalValues += value;
        return value;
      })
    );
    this.nameOfRegions = [];
    for (let index = startCountRegion; index < endCountRegion; index++) {
      this.nameOfRegions.push(mapData[index].name);
    }
  }
}
