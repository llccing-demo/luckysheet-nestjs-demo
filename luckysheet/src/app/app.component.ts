import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var luckysheet: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = '123';
  constructor(private http: HttpClient) {}

  async ngAfterViewInit() {
    // //配置项
    const options = {
      container: 'luckysheet', //luckysheet为容器id
      title: '测试Excel',
      lang: 'zh',
      data: [
        {
          name: 'default',
        },
      ],
      showsheetbarConfig: {
        add: false, //新增sheet
        menu: false, //sheet管理菜单
        sheet: false, //sheet页显示
      },
    };

    this.getData().subscribe((res) => {
      options.data[0] = res;
      luckysheet.create(options);
    });

    let upload: any = document.getElementById('Luckyexcel-demo-file');
    upload.addEventListener('change', (e: any) => {
      const file = e.target.files[0];
      if (file) {
        console.log('file', file);
        this.dealUploadFile(file);
      }
    });

    this.initSocket();
  }

  getData(): Observable<any> {
    const dataUrl = 'http://localhost:3000/option';
    const data = this.http.get(dataUrl);

    return data;
  }

  getCellData(): Observable<any> {
    const cellDataUrl = 'http://localhost:3000/celldata';
    const cellData = this.http.get(cellDataUrl);

    return cellData;
  }

  save() {
    console.log(luckysheet.getAllSheets()[0]);
    console.log(JSON.stringify(luckysheet.getAllSheets()[0]));
  }

  dealUploadFile(file: any) {
    (window as any).LuckyExcel.transformExcelToLucky(
      file,
      function (exportJson: any, luckysheetfile: any) {
        // After obtaining the converted table data, use luckysheet to initialize or update the existing luckysheet workbook
        // Note: Luckysheet needs to introduce a dependency package and initialize the table container before it can be used
        luckysheet.create({
          container: 'luckysheet', // luckysheet is the container id
          data: exportJson.sheets,
          title: exportJson.info.name,
          userInfo: exportJson.info.name.creator,
        });
      }
    );
  }

  initSocket() {
    const socket = (window as any).io('http://localhost:3000');
    socket.on('connect', function () {
      console.log('Connected');

      socket.emit('events', { test: 'test' });
      socket.emit('identity', 0, (response: any) =>
        console.log('Identity:', response)
      );
    });
    socket.on('events', function (data: any) {
      console.log('event', data);
    });
    socket.on('exception', function (data: any) {
      console.log('event', data);
    });
    socket.on('disconnect', function () {
      console.log('Disconnected');
    });
  }
}
