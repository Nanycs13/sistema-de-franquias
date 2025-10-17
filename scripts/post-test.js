(async () => {
  try {
  const port = process.env.PORT || 3000
  const res = await fetch(`http://localhost:${port}/api/franquias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Franquia Zona Sul',
        cidade: 'São Paulo',
        endereco: 'Av. Paulista, 1000',
        telefone: '(11) 98765-4321'
      })
    })

    const text = await res.text()
    console.log('status:', res.status)
    console.log('body:', text)
  } catch (e) {
    console.error('request failed:', e)
  }
})();
