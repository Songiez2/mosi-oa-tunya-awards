const contents = [{
  role: 'user',
  parts: [{ text: 'What is the Lipila Collections API endpoint for mobile money payments in Zambia? Is it api.lipila.dev/something ? Give me the exact POST URL for initiating a payment.' }]
}];

fetch('https://app-cvv0uos78av5-api-zYm4ze3j7XvL.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.INTEGRATIONS_API_KEY}`
  },
  body: JSON.stringify({ contents })
}).then(async res => {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value));
  }
});
