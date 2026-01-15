const pool = require('../conexao')

const listar = async (req, res) => {
  try {
    const result = await pool.query(
      'select id, nome from categorias order by nome'
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao listar categorias' })
  }
}

const criar = async (req, res) => {
  const { nome } = req.body

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da categoria é obrigatório' })
  }

  try {
    const result = await pool.query(
      'insert into categorias (nome) values ($1) returning id, nome',
      [nome]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao criar categoria' })
  }
}

const deletar = async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(
      'delete from categorias where id = $1',
      [id]
    )

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao deletar categoria' })
  }
}

// Atualizar categoria
const atualizar = async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da categoria é obrigatório' })
  }

  try {
    const result = await pool.query(
      `
      update categorias
      set nome = $1
      where id = $2
      returning id, nome
      `,
      [nome, id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao atualizar categoria' })
  }
}

module.exports = {
  listar,
  criar,
  deletar,
  atualizar
}
