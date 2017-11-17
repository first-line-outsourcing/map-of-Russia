import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GeoChart } from './geo.chart';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('geoChart') public geoChart: ElementRef;
  public regionData;
  public options = {
    width: 1000,
    height: 550,
    map: '../assets/geo-data/russia_1e-7sr.json',
    mapData: '../assets/geo-data/russia-region-data.tsv',
    cities: '../assets/geo-data/russia-cities.json',
    year: 2015
  };

  public ngOnInit() {
    const chart = new GeoChart(this.geoChart.nativeElement, this.options);

    chart.clickOnRegion.subscribe((data) => {
      this.regionData = data;
    });
  }

  public getPopulation() {
    if (Array.isArray(this.regionData.population)) {
      return this.regionData.population.find((item) => item.year === this.options.year).amount + '000';
    }
    return this.regionData.population;
  }
}
