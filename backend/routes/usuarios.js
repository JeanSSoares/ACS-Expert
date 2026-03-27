const router = require('express').Router();
const { auth, perfil } = require('../middlewares/auth');
const ctrl = require('../controllers/usuariosController');

// Todas as rotas exigem autenticação
router.use(auth);

// GET    /api/usuarios            → lista (coordenador e gestor)
// POST   /api/usuarios            → cria  (coordenador e gestor)
// GET    /api/usuarios/:id        → detalhe (próprio usuário, coordenador ou gestor)
// PUT    /api/usuarios/:id        → atualiza (coordenador e gestor)
// PATCH  /api/usuarios/:id/senha  → troca senha (próprio usuário ou gestor)
// DELETE /api/usuarios/:id        → desativa (gestor)

router.get(   '/',              perfil('coordenador', 'gestor'), ctrl.listar);
router.post(  '/',              perfil('coordenador', 'gestor'), ctrl.criar);
router.get(   '/:id',           ctrl.buscarPorId);
router.put(   '/:id',           perfil('coordenador', 'gestor'), ctrl.atualizar);
router.patch( '/:id/senha',     ctrl.alterarSenha);
router.delete('/:id',           perfil('gestor'),                ctrl.desativar);

module.exports = router;
