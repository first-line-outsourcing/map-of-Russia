import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GeoChart } from './geo.chart';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('geoChart') public geoChart: ElementRef;
  public regionData;
  public years = [2013, 2014, 2015, 2016, 2017];
  public optionsForm: FormGroup;
  public yearsForm: FormControl;
  public citiesForm: FormControl;
  public options = {
    width: 930,
    height: 550,
    map: '../assets/geo-data/russia_1e-7sr.json',
    mapData: '../assets/geo-data/russia-region-data.json',
    cities: '../assets/geo-data/russia-cities.json',
    year: 2017
  };

  public ngOnInit() {

    this.optionsForm = new FormGroup({
      years: new FormControl(2017),
      city: new FormControl(false),
      regions: new FormControl(false)
    });

    const chart = new GeoChart(this.geoChart.nativeElement, this.options);
    chart.clickOnRegion.subscribe((data) => {
      this.regionData = data;
    });

    this.optionsForm.get('years').valueChanges
      .subscribe((year) => {
        chart.updateData(parseInt(year, 10), 'city');
        chart.updateData(parseInt(year, 10), 'region');
      });

    this.optionsForm.get('city').valueChanges
      .subscribe((checked) => {
        chart.showCities(checked);
        if (!checked) {
          this.regionData = null;
        }
      });

    this.optionsForm.get('regions').valueChanges
      .subscribe((checked) => {
        chart.showNameOfRegions(checked);
      });
  }

  public getPopulation() {
    if (Array.isArray(this.regionData.population)) {
      return this.regionData.population.find((item) => item.year === this.options.year).amount + '000';
    }
    return this.regionData.population;
  }
}
