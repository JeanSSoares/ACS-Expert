const router = require('express').Router();
const { auth, perfil } = require('../middlewares/auth');
const ctrl = require('../controllers/pacientesController');

// Todas as rotas exigem autenticação
router.use(auth);

// GET    /api/pacientes                    → lista (todos os perfis)
// GET    /api/pacientes/:id                → detalhe
// POST   /api/pacientes                    → cria (acs, coordenador, gestor)
// PUT    /api/pacientes/:id                → atualiza
// PUT    /api/pacientes/:id/comorbidades   → substitui comorbidades
// DELETE /api/pacientes/:id                → soft delete (coordenador, gestor)

router.get(   '/',                 ctrl.listar);
router.get(   '/:id',              ctrl.buscarPorId);
router.post(  '/',                 ctrl.criar);
router.put(   '/:id',              ctrl.atualizar);
router.put(   '/:id/comorbidades', ctrl.atualizarComorbidades);
router.delete('/:id',              perfil('coordenador', 'gestor'), ctrl.desativar);

module.exports = router;
