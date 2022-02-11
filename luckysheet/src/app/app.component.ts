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
  // 配置项
  options = {
    container: 'luckysheet', //luckysheet为容器id
    title: '测试Excel',
    lang: 'zh',
    showinfobar: false,
    // 实时更新 start
    // allowUpdate: true,
    // updateUrl: '',
    // loadUrl: '',
    // 实时更新 end
    // 分页相关配置 start
    pager: {
      pageIndex: 1, //当前的页码
      pageSize: 10, //每页显示多少行数据
      total: 50, //数据总行数
      selectOption: [10, 20], //允许设置每页行数的选项
    },
    onTogglePager: function (a: any, b: any, c: any) {
      console.log(a);
      console.log(b);
      console.log(c);
    },
    // 分页相关配置 end
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
  constructor(private http: HttpClient) {}

  async ngAfterViewInit() {
    this.getNormalOption();
    this.initUploadFile();
    this.initSocket();
  }

  getNormalOption() {
    const path = `/option`;

    this.getData(path).subscribe((res) => {
      this.options.data[0] = res.output
      luckysheet.create(this.options);
    });
  }

  getPakoOption() {
    const path = `/option/pako`;

    this.getData(path).subscribe((res) => {
      const result = (window as any).pako.inflate(res.output, { to: 'string' });
      this.options.data[0] = JSON.parse(result);
      luckysheet.create(this.options);
    });
  }

  // TODO 暂时不可用
  // incorrect header check 报错
  getPakoBase64Option() {
    const path = `/option/base64`;
    this.getData(path).subscribe((res) => {
      const result = this.unzip(res.output)
      this.options.data[0] = JSON.parse(result);
      luckysheet.create(this.options);
    });
  }

  getData(path: string, prefix = 'http://localhost:3000'): Observable<any> {
    const dataUrl = `${prefix}${path}`;
    const data = this.http.get(dataUrl);

    return data;
  }

  getCellData(): Observable<any> {
    const cellDataUrl = 'http://localhost:3000/celldata';
    const cellData = this.http.get(cellDataUrl);

    return cellData;
  }

  save() {
    const obj = luckysheet.getAllSheets()[0].data;
    console.log(obj);

    const str = JSON.stringify(obj);
    console.log(str);
    console.log('before length', this.length(str));

    const compress = (window as any).pako.deflate(str);
    const compressStr = JSON.stringify(compress);
    console.log(compress);
    console.log('after length', this.length(compressStr));

    const zipStr = this.zip(str);
    console.log(zipStr);
    console.log('zip length', this.length(zipStr));
  }

  initUploadFile() {
    let upload: any = document.getElementById('Luckyexcel-demo-file');
    upload.addEventListener('change', (e: any) => {
      const file = e.target.files[0];
      if (file) {
        console.log('file', file);
        this.dealUploadFile(file);
      }
    });
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

  // 解压
  unzip(b64Data: any) {
    let strData = atob(b64Data);
    console.log('strData', strData);
    const charData = strData.split('').map(function (x) {
      return x.charCodeAt(0);
    });
    const binData = new Uint8Array(charData);
    console.log('binData', binData);
    let data;
    try {
      data = (window as any).pako.inflate(binData);
      console.log('unzip', data);
      // ... continue processing
    } catch (err) {
      console.log(err);
    }
    strData = String.fromCharCode.apply(null, new Uint16Array(data) as any);
    return decodeURIComponent(strData);
  }

  // 压缩
  zip(str: any) {
    const binaryString = (window as any).pako.gzip(encodeURIComponent(str), {
      to: 'string',
    });
    return btoa(binaryString);
  }

  // 占用字节数计算(UTF-8)
  length(str: string) {
    let total = 0,
      charCode,
      i,
      len;
    for (i = 0, len = str.length; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode <= 0x007f) {
        total += 1;
      } else if (charCode <= 0x07ff) {
        total += 2;
      } else if (charCode <= 0xffff) {
        total += 3;
      } else {
        total += 4;
      }
    }
    const kb = total / 1000;
    return `${kb}kb`;
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
