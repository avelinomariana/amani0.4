// Componente: ResultPage.js (A Página de Resultados do Quiz da Amani)
import React from 'react';
// Importação de componentes Front-End de alta performance
import ProductCard from './ProductCard'; 
import EfficacyInfographic from './EfficacyInfographic'; 

// Recebe 'diagnosisData' (dados enviados pelo Back-End após o cálculo do Quiz)
const ResultPage = ({ diagnosisData }) => {
  const { 
    diagnostico_detalhado, 
    produto_recomendado, 
    alegacao_anvisa 
  } = diagnosisData; 

  return (
    <div className="quiz-result-container">
      
      {/* 1. O Ponto de Confiança: O Diagnóstico Detalhado */}
      <section className="diagnosis-summary">
        <h2>O Resultado Amani: Seu Diagnóstico Detalhado</h2>
        <p className="detailed-report">{diagnostico_detalhado}</p>
        <p className="call-to-action">
          Com base na sua necessidade, este é o tratamento recomendado:
        </p>
      </section>

      {/* 2. O Cartão do Produto (com o link de compra) */}
      <ProductCard product={produto_recomendado} />

      {/* 3. O Detalhe da Eficácia (Infográfico) */}
      <EfficacyInfographic 
        alegacao={alegacao_anvisa} // Texto legal
        tags={produto_recomendado.tags_eficacia} // Atributos do Catálogo
      />
      
      {/* Aqui o Front-End implementaria o Módulo de Performance para carregar
          as imagens de altíssima resolução sem travamentos. */}
    </div>
  );
};

export default ResultPage;