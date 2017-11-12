import { EventEmitter } from '@angular/core';

import * as d3 from 'd3';
import * as queue from 'd3-queue';
import * as topojson from 'topojson';

export interface GeoChartOptions {
  width: number;
  height: number;
  map: string;
  mapData: string;
  cities?: string;
}

export class GeoChart {

  public clickOnRegion: EventEmitter<any> = new EventEmitter<any>();
  private chartNode: Element;
  private $chart;
  private projection;
  private path;
  private options: GeoChartOptions;
  private zoom;
  private g;
  private active;

  constructor(node: Element, options: GeoChartOptions) {
    this.options = options;
    this.chartNode = node;
    this.active = d3.select(null);
    this.$chart = d3.select(this.chartNode)
      .attr('width', this.options.width)
      .attr('height', this.options.height + 50)
      .on('click', this.stopped, true);

    this.$chart.append('rect')
      .attr('class', 'background')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .on('click', this.reset.bind(this));

    this.g = this.$chart.append('g');

    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', this.zoomed.bind(this));

    this.projection = d3.geoConicEqualArea()
      .rotate([-105, 0])
      .center([-10, 65])
      .parallels([52, 64])
      .scale(750)
      .translate([this.options.width / 2, this.options.height / 2]);

    this.path = d3.geoPath().projection(this.projection);

    this.$chart.call(this.zoom);

    const q = queue.queue()
      .defer(d3.json, this.options.map)
      .defer(d3.tsv, this.options.mapData);

    if (this.options.cities) {
      q.defer(d3.tsv, this.options.cities);
    }

    q.await(this.ready.bind(this));
  }

  public ready(error, map, data, cities?) {
    if (error) {
      throw error;
    }
    const features = topojson.feature(map, map.objects.russia).features;
    features.forEach((item) => {
      const findRegion = data.find((region) => region.region === item.properties.region);
      item.properties.name = findRegion.name;
      item.properties.population = findRegion.population;
    });

    this.g
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', 'feature')
      .on('click', this.clickedRegion.bind(this));

    if (cities) {
      this.g.selectAll('circle')
        .data(cities)
        .enter()
        .append('circle')
        .attr('cx', d => this.projection([d.lon, d.lat])[0])
        .attr('cy', d => this.projection([d.lon, d.lat])[1])
        .attr('r', d => {
          const population = parseInt(d.population, 10) / 1000000;
          return population >= 10 ? 15 : population < 10 && population >= 5 ? 10 : 5;
        })
        .attr('class', 'circle')
        .on('click', this.clickedCity.bind(this));

      // add legend
      const legend = this.g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(120,${this.options.height - 230})`)
        .style('font-size', '4px');

      legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 0)
        .attr('r', 15)
        .style('fill', 'white')
        .style('stroke', 'black');

      legend.append('text')
        .attr('x', 15)
        .attr('y', -10)
        .text('> 10m');

      legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 5)
        .attr('r', 10)
        .style('fill', 'white')
        .style('stroke', 'black');

      legend.append('text')
        .attr('x', 15)
        .attr('y', 0)
        .text('> 5m');

      legend.append('circle')
        .attr('cx', 20)
        .attr('cy', 10)
        .attr('r', 5)
        .style('fill', 'white')
        .style('stroke', 'black');

      legend.append('text')
        .attr('x', 15)
        .attr('y', 12)
        .text('< 5m');
    }

  }

  private clickedRegion(d) {
    if (this.active.node() === d3.event.path[0]) {
      this.clickOnRegion.emit(null);
      return this.reset();
    }
    this.active.classed('active', false);
    this.active = d3.select(d3.event.path[0]).classed('active', true);

    const bounds = this.path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / this.options.width, dy / this.options.height)));
    const translate = [this.options.width / 2 - scale * x, this.options.height / 2 - scale * y];

    this.$chart.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

    this.clickOnRegion.emit(d.properties);
  }

  private clickedCity(d) {
    if (this.active.node() === d3.event.path[0]) {
      this.clickOnRegion.emit(null);
      return this.reset();
    }

    this.active.classed('active', false);
    this.active = d3.select(d3.event.path[0]).classed('active', true);
    this.clickOnRegion.emit(d);
  }

  private zoomed() {
    this.g.style('stroke-width', 0.5 / d3.event.transform.k + 'px');
    this.g.attr('transform', d3.event.transform);
  }

  private reset() {
    this.active.classed('active', false);
    this.active = d3.select(null);

    this.$chart.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);

    this.clickOnRegion.emit(null);
  }

  private stopped() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }
}
