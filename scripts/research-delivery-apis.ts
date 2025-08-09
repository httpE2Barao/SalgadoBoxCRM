import ZAI from 'z-ai-web-dev-sdk';

async function researchDeliveryAPIs() {
  try {
    const zai = await ZAI.create();

    const searchResult = await zai.functions.invoke("web_search", {
      query: "lalamove api documentation driver request integration",
      num: 10
    });

    console.log('Resultados da pesquisa sobre Lalamove API:');
    console.log('=====================================');
    
    searchResult.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Snippet: ${result.snippet}`);
      console.log('---');
    });

    // Pesquisar alternativas
    const alternativesResult = await zai.functions.invoke("web_search", {
      query: "food delivery driver api integration alternatives ifood uber eats",
      num: 8
    });

    console.log('\n\nAlternativas de API de Entrega:');
    console.log('==============================');
    
    alternativesResult.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Snippet: ${result.snippet}`);
      console.log('---');
    });

  } catch (error: any) {
    console.error('Erro na pesquisa:', error.message);
  }
}

researchDeliveryAPIs();