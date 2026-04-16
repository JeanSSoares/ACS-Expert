const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const ctrl = require('../controllers/triagensController');

// Todas as rotas exigem autenticação
router.use(auth);

// GET    /api/triagens/catalogo   → listas de sintomas, qualificadores, doenças (para a UI)
// POST   /api/triagens/avaliar    → roda o motor SEM persistir (preview)
// GET    /api/triagens            → lista (filtros: paciente_id, acs_id, nivel_risco, desde, ate, limit)
// POST   /api/triagens            → cria triagem (roda motor + salva + atualiza paciente)
// GET    /api/triagens/:id        → detalhe (inclui sintomas e resultados TOP-N)

router.get(  '/catalogo', ctrl.catalogo);
router.post( '/avaliar',  ctrl.avaliar);
router.get(  '/',         ctrl.listar);
router.post( '/',         ctrl.criar);
router.get(  '/:id',      ctrl.buscarPorId);

module.exports = router;
