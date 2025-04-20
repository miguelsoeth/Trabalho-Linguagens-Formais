import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrammarResolverService } from '../../services/grammar-resolver.service';
import { Passos } from '../../interfaces/passos';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent {
  linhas: string[] = [''];
  resultado: Record<string, string[]> | null = null;
  producaoFinal: Passos[] = [];
  resolver = new GrammarResolverService();

  adicionarLinha() {
    this.linhas = [...this.linhas, ''];
  }

  removerLinha(index: number) {
    this.linhas = this.linhas.filter((_, i) => i !== index);
  }

  trackByIndex(index: number, item: string): number {
    return index;
  }

  gerarExemplo() {
    const exemplos = [
      ['S->0B,1A', 'A->0,0S,1AA', 'B->1,1S,0BB'],
      ['S->0A,1S,2S', 'A->0A,1S,2S,~'],
      ['S->aSb,ab'],
      ['S->0S,1S,~'],
      ['S->aA','A->bB,~', 'B->aA']
    ];
  
    const index = Math.floor(Math.random() * exemplos.length);
    this.linhas = exemplos[index];
  }

  gerarObjeto() {
    const erros: string[] = [];
    const gramatica: Record<string, string[]> = {};
    const chaves: string[] = [];
    const precisaSerChave: string[] = [];

    var isNumber = false;
    var isLowerCase = false;
    var isProducaoVazia = false;

    // Validações iniciais das linhas
    this.linhas.forEach((linha, i) => {
      const partes = linha.split('->');
      if (partes.length !== 2) {
        erros.push(`Linha ${i + 1}: formato inválido. Use X->aB,C`);
        return;
      }

      const chave = partes[0].trim();
      if (!/^[A-Z]$/.test(chave)) {
        erros.push(`Linha ${i + 1}: chave deve ser única letra maiúscula (A-Z)`);
        return;
      }
      chaves.push(chave);

      const alternativas = partes[1]
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      if (alternativas.some(v => /[a-z]/.test(v)) && !isLowerCase) {
        isLowerCase = true;
      }

      if (alternativas.some(v => /\d/.test(v)) && !isNumber) {
        isNumber = true;
      }

      if (alternativas.length <= 0 && !isProducaoVazia) {
        isProducaoVazia = true;
      }

      alternativas.forEach(prod => {
        if (/[a-z]/.test(prod) && /\d/.test(prod)) {
          erros.push(
            `Linha ${i + 1}, produção '${prod}': não pode misturar letras minúsculas e números`
          );
        }

        if (!/^[a-zA-Z0-9~]+$/.test(prod)) {
          erros.push(
            `Linha ${i + 1}, produção '${prod}': a produção só pode conter letras minúsculas, maiúsculas, números ou til (~)`
          );
        }

        if (/[A-Z]/.test(prod)) {
          const upperCaseLetters = prod.match(/[A-Z]/g) || [];
          precisaSerChave.push(...upperCaseLetters);
        }
      });
    });

    if (isLowerCase && isNumber) {
      erros.push(`Gramática deve conter ou somente numeros ou somente letras minúsculas para representar os caractéres terminais`)
    }

    if (!chaves.includes('S')) {
      erros.push(`Gramática deve conter pelo menos uma chave 'S' como símbolo inicial`);
    }

    const duplicates = chaves.filter((item, index) => chaves.indexOf(item) !== index);
    if (duplicates.length > 0) {
      erros.push(`Gramática não deve conter chaves duplicadas: ${[...new Set(duplicates)].join(', ')}`);
    }

    const chavesQueFaltam = precisaSerChave.filter(letra => !chaves.includes(letra));
    if (chavesQueFaltam.length > 0) {
      erros.push(`As seguintes chaves precisam ter produções definidas: ${[...new Set(chavesQueFaltam)].join(', ')}`);
    }

    if (isProducaoVazia) {
      erros.push(`Não poderá haver produções vazias!`)
    }

    if (erros.length) {
      alert('Erros na gramática:\n' + erros.join('\n'));
      this.resultado = null;
      return;
    }

    // Monta o objeto sem incluir strings vazias
    this.linhas.forEach(linha => {
      const [lhs, rhs] = linha.split('->').map(p => p.trim());
      const alternativas = rhs
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      if (alternativas.length === 0) return;

      if (!gramatica[lhs]) {
        gramatica[lhs] = [];
      }
      gramatica[lhs].push(...alternativas);
    });

    this.resultado = gramatica;

    try {
      const output = this.resolver.resolver(this.resultado);
      this.producaoFinal = output;
    } catch (e) {
      alert((e as Error).message);
    }
  }
} 