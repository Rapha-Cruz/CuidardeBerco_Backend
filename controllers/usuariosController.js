const supabase = require('../supabaseClient')

// Login com email e senha
const login = async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' })
  }
  console.log("email: ", email);
  console.log("senha: ", senha);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })

    if (error) {
      return res.status(401).json({ erro: 'Credenciais inválidas' })
    }

    res.json({
      usuario: {
        id: data.user.id,
        email: data.user.email
      },
      access_token: data.session.access_token
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro no login' })
  }
}

module.exports = {
  login
}
