const supabase = require('../supabaseClient')

const uploadArquivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo não enviado' })
    }

    const { originalname, mimetype, buffer } = req.file

    let pasta = 'outros'
    if (mimetype.startsWith('image/')) pasta = 'imagens'
    if (mimetype === 'application/pdf') pasta = 'pdfs'

    const nomeArquivo = `${Date.now()}-${originalname}`
    const caminho = `${pasta}/${nomeArquivo}`

    const { error } = await supabase.storage
      .from('CuidarDeBerco')
      .upload(caminho, buffer, {
        contentType: mimetype,
        upsert: false
      })

    if (error) {
      console.error('Erro Supabase:', error)
      return res.status(500).json({ erro: 'Erro ao subir arquivo' })
    }

    const { data } = supabase.storage
      .from('CuidarDeBerco')
      .getPublicUrl(caminho)

    if (!data?.publicUrl) {
      return res.status(500).json({ erro: 'Erro ao gerar URL pública' })
    }

    res.json({
      url: data.publicUrl,
      nome_original: originalname,
      tipo: mimetype.startsWith('image/')
        ? 'imagem'
        : mimetype === 'application/pdf'
        ? 'pdf'
        : 'outro'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro no upload' })
  }
}

module.exports = {
  uploadArquivo
}
