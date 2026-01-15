const pool = require('../conexao')

/**
 * LISTAR ARTIGOS (HOME)
 */
const listar = async (req, res) => {
    try {
        const result = await pool.query(`
            select 
                a.id,
                a.titulo,
                a.resumo,
                a.conteudo,
                a.criado_em,
                c.nome as categoria
            from artigos a
            left join categorias c on c.id = a.categoria_id
            order by a.criado_em desc
        `)

        res.json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro ao listar artigos' })
    }
}

/**
 * BUSCAR ARTIGO POR ID (COM MÍDIAS)
 */
const buscarPorId = async (req, res) => {
    const { id } = req.params

    try {
        const artigo = await pool.query(
            'select * from artigos where id = $1',
            [id]
        )

        if (artigo.rowCount === 0) {
            return res.status(404).json({ erro: 'Artigo não encontrado' })
        }

        const midias = await pool.query(
            `
            select id, tipo, caminho, ordem
            from artigos_midias
            where artigo_id = $1
            order by ordem
            `,
            [id]
        )

        res.json({
            ...artigo.rows[0],
            midias: midias.rows
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro ao buscar artigo' })
    }
}

/**
 * CRIAR ARTIGO (COM MÍDIAS)
 */
const criar = async (req, res) => {
    const { titulo, resumo, conteudo, categoria_id, midias = [] } = req.body

    if (!titulo || !resumo || !conteudo) {
        return res.status(400).json({
            erro: 'Título, resumo e conteúdo são obrigatórios'
        })
    }

    try {
        const artigo = await pool.query(
            `
            insert into artigos (titulo, resumo, conteudo, categoria_id)
            values ($1, $2, $3, $4)
            returning id
            `,
            [titulo, resumo, conteudo, categoria_id || null]
        )

        const artigoId = artigo.rows[0].id

        for (const m of midias) {
            // ignora mídia inválida
            if (!m || !m.tipo || !m.caminho || m.caminho.trim() === '') {
                continue
            }

            await pool.query(
                `
    insert into artigos_midias
      (artigo_id, tipo, caminho, ordem)
    values
      ($1, $2, $3, $4)
    `,
                [
                    artigoId,
                    m.tipo,
                    m.caminho,
                    m.ordem || 1
                ]
            )
        }

        res.status(201).json({ id: artigoId })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro ao criar artigo' })
    }
}

/**
 * ATUALIZAR ARTIGO (COM MÍDIAS)
 */
const atualizar = async (req, res) => {
    const { id } = req.params
    const { titulo, resumo, conteudo, categoria_id, midias = [] } = req.body

    try {
        const result = await pool.query(
            `
            update artigos
            set titulo = $1,
                resumo = $2,
                conteudo = $3,
                categoria_id = $4
            where id = $5
            returning id
            `,
            [titulo, resumo, conteudo, categoria_id || null, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Artigo não encontrado' })
        }

        // Remove mídias antigas
        await pool.query(
            'delete from artigos_midias where artigo_id = $1',
            [id]
        )

        // Insere novas mídias
        for (const m of midias) {

            // 🔒 VALIDAÇÃO OBRIGATÓRIA
            if (
                !m ||
                !m.tipo ||
                !m.caminho ||
                typeof m.caminho !== 'string' ||
                m.caminho.trim() === ''
            ) {
                console.warn('Mídia ignorada por estar inválida:', m)
                continue
            }

            // valida tipo
            if (!['imagem', 'video', 'pdf'].includes(m.tipo)) {
                console.warn('Tipo de mídia inválido:', m.tipo)
                continue
            }

            await pool.query(
                `
    insert into artigos_midias
      (artigo_id, tipo, caminho, ordem)
    values
      ($1, $2, $3, $4)
    `,
                [
                    id,
                    m.tipo,
                    m.caminho,
                    m.ordem || 1
                ]
            )
        }

        res.json({ mensagem: 'Artigo atualizado com sucesso' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro ao atualizar artigo' })
    }
}

/**
 * DELETAR ARTIGO
 */
const deletar = async (req, res) => {
    const { id } = req.params

    try {
        await pool.query(
            'delete from artigos where id = $1',
            [id]
        )

        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro ao deletar artigo' })
    }
}

/**
 * PESQUISA POR TÍTULO OU CONTEÚDO
 */
const pesquisar = async (req, res) => {
    const { q } = req.query

    if (!q) {
        return res.status(400).json({ erro: 'Parâmetro de busca é obrigatório' })
    }

    try {
        const result = await pool.query(
            `
            select id, titulo, resumo, conteudo, criado_em
            from artigos
            where titulo ilike $1
               or conteudo ilike $1
            order by criado_em desc
            `,
            [`%${q}%`]
        )

        res.json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro na pesquisa' })
    }
}

// Listar artigos por categoria
const listarPorCategoria = async (req, res) => {
    const { categoriaId } = req.params

    try {
        const result = await pool.query(
            `
      select 
        a.id,
        a.titulo,
        a.conteudo,
        a.criado_em,
        c.nome as categoria
      from artigos a
      left join categorias c on c.id = a.categoria_id
      where a.categoria_id = $1
      order by a.criado_em desc
      `,
            [categoriaId]
        )

        res.json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: 'Erro ao listar artigos por categoria' })
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    deletar,
    pesquisar,
    listarPorCategoria
}
