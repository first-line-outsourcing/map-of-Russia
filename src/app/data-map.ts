import { EventEmitter } from '@angular/core';

import * as d3 from 'd3';

import { randomNumber } from './shared/helper';

export class DataMap {
  public loadData = new EventEmitter<any>();
  private dataMap = [];

  public loadMapData(source: string) {
    d3.json(source, (data) => {
      this.dataMap = data.regions;

      this.dataMap.forEach((item) => {
        for (const year in item.data) {
          Object.assign(item.data[year], {
            death: randomNumber(50, 100),
            density: randomNumber(10, 100)
          });
        }
      });

      this.loadData.emit(this.dataMap);
    });
  }
}
