const supabase = require('../supabaseClient')

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não informado' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ erro: 'Token inválido' })
    }

    req.usuario = data.user
    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro de autenticação' })
  }
}

module.exports = authMiddleware
