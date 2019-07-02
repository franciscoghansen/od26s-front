import {Component, OnInit} from '@angular/core';
import {LoginService} from '../login/login.service';
import {FormularioService} from '../services/formulario.service';
import {Formulario} from '../model/formulario';
import {Usuario} from "../model/usuario";
import {UsuarioService} from "../services/usuario.service";
import {Message} from "primeng/api";
import {InstituicaoService} from "../services/instituicao.service";
import {Instituicao} from "../model/instituicao";
import {AmostraService} from "../services/amostra.service";
import {Amostra} from "../model/amostra";
import {Modelo} from "../model/modelo";

@Component({
  selector: 'app-lista-formularios',
  templateUrl: './lista-formularios.component.html',
  styleUrls: ['./lista-formularios.component.css']
})
export class ListaFormulariosComponent implements OnInit {

  msgs: Message[] = [];
  private formularios: Array<Formulario>;
  private instituicoes: Array<Instituicao>;
  private orientadores: Array<Usuario>;
  private amostras: Array<Amostra>;
  private totalRecords: number;
  private userDialog = false;
  private showAmostraDialog = false;
  private usuarioEdit: Usuario;
  private formEdit: Formulario;
  private tipoPessoa = [
    {label: 'Aluno', value: 'Aluno'},
    {label: 'Externo', value: 'Externo'},
    {label: 'Orientador', value: 'Orientador'},
    {label: 'Pesquisador', value: 'Pesquisador'},
  ];

  constructor(private loginService: LoginService,
              private formularioService: FormularioService,
              private usuarioService: UsuarioService,
              private instituicaoService: InstituicaoService,
              private amostraService: AmostraService) {
  }

  ngOnInit() {
    this.usuarioEdit = new Usuario();
    this.formEdit = new Formulario();

    if (this.isAdmin()) {
      this.findAllForms();
      this.findAllInstituicoes();
      this.findAllOrientadores();
    }
  }

  isAdmin(): boolean {
    return this.loginService.hasRole('ADMIN');
  }

  findAllForms() {
    if (this.isAdmin()) {
      this.formularioService.findAll().subscribe(formularios => {
        this.formularios = formularios;
        this.totalRecords = formularios.length;
      });
    }
  }

  findAllInstituicoes() {
    this.instituicaoService.findAll().subscribe(instituicoes => {
      this.instituicoes = instituicoes;
    });
  }

  findAllOrientadores() {
    this.usuarioService.findOrientadores().subscribe(orientadores => {
      this.orientadores = orientadores;
    });
  }

  showUserDialog(user: Usuario) {
    this.usuarioEdit = JSON.parse(JSON.stringify(user));
    this.userDialog = true;
  }

  closeUserDialog() {
    this.userDialog = false;
    this.formEdit = new Formulario();
    this.formEdit.usuario = new Usuario();
    this.formEdit.modelo = new Modelo();
  }

  saveUser(isValid: boolean) {
    this.usuarioService.save(this.usuarioEdit).subscribe(() => {
      this.findAllForms();
      this.closeUserDialog();
      this.msgs = [{
        severity: 'success',
        summary: 'Confirmado',
        detail: 'Cadastro de usuário salvo com sucesso!'
      }];
    }, error => {
      console.error(error);
      this.msgs = [{
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao salvar cadastro de usuário!'
      }];
    });
  }
}
