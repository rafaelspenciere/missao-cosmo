/**
 * MISSÃO COSMO — Google Apps Script
 * Cria uma planilha privada para o proprietário e registra cada partida recebida.
 * Execute setup() uma vez antes de implantar o Web App.
 */
const NOME_PLANILHA = 'Missão Cosmo - Resultados';
const ABA_RESULTADOS = 'Partidas';

function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create(NOME_PLANILHA);
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  let sheet = ss.getSheetByName(ABA_RESULTADOS);
  if (!sheet) sheet = ss.insertSheet(ABA_RESULTADOS);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Data e hora', 'Jogador', 'Acertos', 'Erros', 'Total de perguntas',
      'Pontuação', 'Resultado', 'Placar jogador', 'Placar adversário',
      'Personagem', 'ID da partida', 'Origem'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#17365d').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, 12);
  }
  Logger.log('Planilha criada/configurada: ' + ss.getUrl());
  return ss.getUrl();
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Requisição vazia');
    const data = JSON.parse(e.postData.contents);
    const nome = String(data.nome || '').trim().replace(/[\r\n\t]/g, ' ').slice(0, 40);
    const acertos = inteiro(data.acertos);
    const erros = inteiro(data.erros);
    const total = inteiro(data.totalPerguntas);
    const pontos = inteiro(data.pontuacao);
    const resultado = String(data.resultado || '').slice(0, 20);
    const idPartida = String(data.idPartida || '').slice(0, 80);
    if (!nome || nome.length < 2) throw new Error('Nome inválido');
    if (acertos < 0 || erros < 0 || total < 1 || acertos + erros !== total) throw new Error('Pontuação inválida');
    if (pontos !== acertos * 100) throw new Error('Cálculo de pontos inválido');
    if (!['VITÓRIA', 'DERROTA'].includes(resultado)) throw new Error('Resultado inválido');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
      if (!id) throw new Error('Execute setup() antes de usar o registro');
      const ss = SpreadsheetApp.openById(id);
      const sheet = ss.getSheetByName(ABA_RESULTADOS);
      // Evita duplicidade caso o navegador repita o envio da mesma partida.
      if (idPartida) {
        const last = sheet.getLastRow();
        if (last > 1) {
          const ids = sheet.getRange(2, 11, last - 1, 1).getValues().flat();
          if (ids.includes(idPartida)) return resposta('duplicado');
        }
      }
      sheet.appendRow([
        new Date(), nome, acertos, erros, total, pontos, resultado,
        inteiro(data.placarJogador), inteiro(data.placarAdversario),
        String(data.skin || '').slice(0, 30), idPartida, 'Missão Cosmo'
      ]);
    } finally {
      lock.releaseLock();
    }
    return resposta('ok');
  } catch (err) {
    console.error(err);
    return resposta('erro');
  }
}

function inteiro(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? Math.floor(n) : -1;
}

function resposta(status) {
  return ContentService.createTextOutput(JSON.stringify({ status }))
    .setMimeType(ContentService.MimeType.JSON);
}
