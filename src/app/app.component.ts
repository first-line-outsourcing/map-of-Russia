import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataMap } from './data-map';
import { BarChart, BarChartOptions } from './shared/charts/bar.chart';
import { ChordChart, ChordChartOptions } from './shared/charts/chord.chart';

import { GeoChart, GeoChartOptions } from './shared/charts/geo.chart';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('geoChart') public geoChart: ElementRef;
  @ViewChild('barChart') public barChart: ElementRef;
  @ViewChild('chordChart') public chordChart: ElementRef;

  public regionData;
  public selectedTrade;
  public years = [2013, 2014, 2015, 2016, 2017];
  public optionsForm: FormGroup;
  public geoOptions: GeoChartOptions;
  public barOptions: BarChartOptions;
  public chordOptions: ChordChartOptions;
  public isShowLife: boolean;
  public isShowTrade: boolean;
  private dataMap: DataMap;
  private chart$: GeoChart;
  private barChart$: BarChart;
  private chordChart$: ChordChart;

  public ngOnInit() {

    this.optionsForm = new FormGroup({
      years: new FormControl(2017),
      city: new FormControl(false),
      regions: new FormControl(false),
      density: new FormControl(false),
      life: new FormControl(false),
      trade: new FormControl(false)
    });

    this.dataMap = new DataMap();
    this.dataMap.loadData.subscribe((data) => {
      const width = 930;
      this.geoOptions = {
        width,
        height: 550,
        map: '../assets/geo-data/russia.json',
        mapData: data,
        cities: '../assets/geo-data/russia-cities.json',
        year: 2017
      };
      this.barOptions = {
        width,
        barHeight: 25,
        mapData: data,
        year: 2017
      };

      this.chordOptions = {
        width,
        height: 800,
        mapData: data
      };

      this.chart$ = new GeoChart(this.geoChart.nativeElement, this.geoOptions);

      this.chart$.clickOnRegion.subscribe((clickedRegion) => {
        this.regionData = clickedRegion;
        if (this.barChart$) {
          this.barChart$.selectRegion(clickedRegion ? clickedRegion.region : null);
        }
      });
    });
    this.dataMap.loadMapData('../assets/geo-data/russia-region-data.json');

    this.optionsForm.get('years').valueChanges.subscribe((year) => {
      this.geoOptions.year = parseInt(year, 10);
      this.barOptions.year = parseInt(year, 10);
      this.chart$.updateData(this.geoOptions.year, this.optionsForm.value);
      if (this.barChart$) {
        this.barChart$.updateData(this.barOptions, this.regionData ? this.regionData.region : null);
      }
      if (this.chordChart$) {
        this.chordChart$.updateYear();
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
        setTimeout(() => this.barChart$ = new BarChart(this.barChart.nativeElement, this.barOptions,
          this.regionData ? this.regionData.region : null));
      } else {
        this.barChart$ = null;
      }
    });

    this.optionsForm.get('trade').valueChanges.subscribe((checked) => {
      this.isShowTrade = checked;
      if (!this.chordChart$) {
        setTimeout(() => {
          this.chordChart$ = new ChordChart(this.chordChart.nativeElement, this.chordOptions);
          this.chordChart$.selectTrade.subscribe((data) => this.selectedTrade = data);
        });
      } else {
        this.chordChart$ = null;
      }
    });
  }

  public getPopulation() {
    if (Array.isArray(this.regionData.population)) {
      return this.regionData.population.find((item) => item.year === this.geoOptions.year).amount + '000';
    }
    return this.regionData.population;
  }

  public calcPercent(trade, field: string, allTotals?: number) {
    if (allTotals) {
      return (trade[field].value / allTotals * 100).toFixed(1);
    }
    return (trade[field].value / trade[field].total * 100).toFixed(1);
  }
}
