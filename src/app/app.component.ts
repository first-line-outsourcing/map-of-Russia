import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BarChart } from './shared/charts/bar.chart';

import { GeoChart } from './shared/charts/geo.chart';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('geoChart') public geoChart: ElementRef;
  @ViewChild('barChart') public barChart: ElementRef;
  public regionData;
  public years = [2013, 2014, 2015, 2016, 2017];
  public optionsForm: FormGroup;
  public geoOptions = {
    width: 930,
    height: 550,
    map: '../assets/geo-data/russia_1e-7sr.json',
    mapData: '../assets/geo-data/russia-region-data.json',
    cities: '../assets/geo-data/russia-cities.json',
    year: 2017
  };
  public barOptions = {
    width: 930,
    barHeight: 25,
    mapData: '../assets/geo-data/russia-region-data.json'
  };
  public isShowLife: boolean;
  private chart$: GeoChart;
  private barChart$: BarChart;

  public ngOnInit() {

    this.optionsForm = new FormGroup({
      years: new FormControl(2017),
      city: new FormControl(false),
      regions: new FormControl(false),
      density: new FormControl(false),
      life: new FormControl(false)
    });

    this.chart$ = new GeoChart(this.geoChart.nativeElement, this.geoOptions);

    this.chart$.clickOnRegion.subscribe((data) => {
      this.regionData = data;
      if (this.barChart$) {
        this.barChart$.selectRegion(data ? data.region : null);
      }
    });

    this.optionsForm.get('years').valueChanges.subscribe((year) => {
      this.chart$.updateData(parseInt(year, 10), this.optionsForm.value);
      if (this.barChart$) {
        this.barChart$.updateData();
      }
    });

    this.optionsForm.get('city').valueChanges.subscribe((checked) => {
      this.chart$.showCities(checked);
      if (!checked) {
        this.regionData = null;
      }
    });

    this.optionsForm.get('regions').valueChanges.subscribe((checked) => {
      this.chart$.showNameOfRegions(checked);
    });

    this.optionsForm.get('density').valueChanges.subscribe((checked) => {
      this.chart$.showDensity(checked);
    });

    this.optionsForm.get('life').valueChanges.subscribe((checked) => {
      this.isShowLife = checked;
      if (!this.barChart$) {
        setTimeout(() => this.barChart$ = new BarChart(this.barChart.nativeElement, this.barOptions));
      } else {
        this.barChart$ = null;
      }
    });
  }

  public getPopulation() {
    if (Array.isArray(this.regionData.population)) {
      return this.regionData.population.find((item) => item.year === this.geoOptions.year).amount + '000';
    }
    return this.regionData.population;
  }
}
