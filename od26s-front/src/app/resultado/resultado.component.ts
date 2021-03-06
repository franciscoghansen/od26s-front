import {Component, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, DataTable, LazyLoadEvent, Message} from 'primeng/primeng';
import {Resultado} from '../model/resultado';
import {ResultadoService} from '../services/resultado.service';
import {environment} from '../../environments/environment';
import {Usuario} from '../model/usuario';
import {UsuarioService} from '../services/usuario.service';
import {Formulario} from '../model/formulario';
import {FormularioService} from '../services/formulario.service';
import * as ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-resultado',
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css']
})
export class ResultadoComponent implements OnInit {

  public editor = ClassicEditorBuild;

  @ViewChild('dt') dataTable: DataTable;

  resultados: Resultado[];
  totalRecords: number;
  maxRecords = 10;
  currentPage = 1;
  resultadoEdit = new Resultado();
  showDialog = false;
  visualizaLaudo = false;
  msgs: Message[] = [];
  uploadedFiles: any[] = [];
  urlApi: string = environment.api;
  today: string = new Date().toString();
  usuarios: Usuario[];
  formularios: Formulario[];


  constructor(private resultadoService: ResultadoService,
              private confirmationService: ConfirmationService,
              private usuarioService: UsuarioService,
              private formularioService: FormularioService) {
  }

  ngOnInit() {
    this.carregarCombos();
    this.findAll();
  }

  carregarCombos() {
    this.usuarioService.findAll().subscribe(e => this.usuarios = e);
    this.formularioService.findAll().subscribe(e => this.formularios = e);
  }

  lazyLoad(event: LazyLoadEvent) {
    const pageNumber = event.first / event.rows;
    this.currentPage = pageNumber;

    this.maxRecords = event.rows;

    setTimeout(() => {
      this.findAllPaged(this.currentPage, this.maxRecords);
    }, 250);
  }

  findAllPaged(page: number, size: number) {
    this.resultadoService.findPageable(page, size).subscribe(e => {
      this.resultados = e.content;

      this.totalRecords = e.totalElements;
    });
  }

  findAll() {
    this.resultadoService.findAll().subscribe(e => this.resultados = e);
  }

  newEntity() {
    this.showDialog = true;
    this.resultadoEdit = new Resultado();
    this.resultadoEdit.today = new Date();
    this.resultadoEdit.formulario = this.formularios[0];
    this.resultadoEdit.usuario = this.usuarios[0];
    this.resultadoEdit.laudo = '';
  }


  save() {
    this.resultadoService.save(this.resultadoEdit).subscribe(e => {
        this.showDialog = false;
        this.dataTable.reset();

        this.resultadoEdit = new Resultado();
        this.resultadoEdit.today = new Date();
        this.resultadoEdit.formulario = this.formularios[0];
        this.resultadoEdit.usuario = this.usuarios[0];
        this.resultadoEdit.laudo = '';

        // this.editor = ClassicEditorBuild;

        this.msgs = [{severity: 'success', summary: 'Confirmado', detail: 'Registro salvo com sucesso!'}];
      },
      error => {
        this.msgs = [{severity: 'error', summary: 'Erro', detail: 'Falha ao salvar o registro!'}];
      }
    );
  }

  cancel() {
    this.showDialog = false;
  }

  edit(resultado: Resultado) {
    if (!!resultado) {
      this.resultadoEdit = JSON.parse(JSON.stringify(resultado));
    }

    if (!this.resultadoEdit.laudo) {
      this.resultadoEdit.laudo = '';
    }

    this.showDialog = true;
  }

  visualizarLaudo(resultado: Resultado) {

    if (!!resultado) {
      this.resultadoEdit = JSON.parse(JSON.stringify(resultado));
    }

    if (!this.resultadoEdit.laudo) {
      this.resultadoEdit.laudo = '';
    }

    this.visualizaLaudo = true;
  }


  delete(resultado: Resultado) {
    this.confirmationService.confirm({
      message: 'Esta ação não poderá ser desfeita!',
      header: 'Deseja remover o registro?',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.resultadoService.delete(resultado.id).subscribe(() => {
          this.dataTable.reset();
          this.msgs = [{
            severity: 'success', summary: 'Confirmado',
            detail: 'Registro removido com sucesso!'
          }];
        }, error => {
          this.msgs = [{
            severity: 'error', summary: 'Erro',
            detail: 'Falha ao remover o registro!'
          }];
        });
      }
    });
  }

  onUpload(event) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.msgs = [{
      severity: 'info', summary: 'Arquivo salvo',
      detail: 'Arquivo salvo com sucesso!'
    }];
    setTimeout(() => {
      this.dataTable.reset();
      this.showDialog = false;
      this.uploadedFiles = [];
    }, 500);
  }

  fazerDownload(id: number, content: string, fileName: string) {
    this.resultadoService.download(id, content).subscribe( d => {
      this.resultadoService.downloadFile(d, content, fileName);
    });
  }
}
