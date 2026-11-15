import type { PatinhasTipo, RewardId } from '../types'

/**
 * Regras do Clube Patinhas só para mostrar na tela.
 * Quem vale de verdade é o banco (supabase/migrations/0003_patinhas.sql): se mudar um número aqui, mude lá também.
 * A conta de custo está em docs/clube-patinhas.md.
 */
export const PATINHAS_RULES = {
  perBath: 60,
  streakDays: 7,
  streakBonus: 100,
  monthlyCap: 900,
  perPet: 50,
  maxPets: 3,
  firstSubscription: 200,
  expiryDays: 180,
}

export interface Reward {
  id: RewardId
  name: string
  text: string
  cost: number
}

export const REWARDS: Reward[] = [
  { id: 'mimo', name: 'Adesivos extras do seu pet', text: 'Uma cartela de adesivos com o avatar do seu pet na próxima box.', cost: 700 },
  { id: 'desc5', name: 'R$ 5 de desconto', text: 'Abatidos na sua próxima mensalidade.', cost: 1000 },
  { id: 'ong', name: 'Doe R$ 5 para uma ONG', text: 'A gente doa por você para uma das ONGs que apoiamos.', cost: 1000 },
  { id: 'desc10', name: 'R$ 10 de desconto', text: 'Abatidos na sua próxima mensalidade.', cost: 2000 },
  { id: 'frete', name: 'Frete grátis', text: 'Sem pagar frete na sua próxima box.', cost: 3000 },
]

export const findReward = (id: string) => REWARDS.find((r) => r.id === id)

export const MOVEMENT_LABELS: Record<PatinhasTipo, string> = {
  banho: 'Banho completo',
  sequencia: 'Bônus de sequência',
  pet: 'Pet criado',
  assinatura: 'Primeira assinatura',
  resgate: 'Troca',
  expiracao: 'Patinhas vencidas',
}

export const formatPatinhas = (n: number) => n.toLocaleString('pt-BR')

/** Mensagem do fim do banho, conforme o que o banco creditou. */
export function bathMessage(motivo: string, creditado: number): string {
  if (creditado > 0) return motivo === 'sequencia' ? `Sequência de ${PATINHAS_RULES.streakDays} dias! Você ganhou ${creditado} Patinhas.` : `Você ganhou ${creditado} Patinhas.`
  if (motivo === 'ja_ganhou_hoje') return 'O banho de hoje que rende Patinhas já foi. Volte amanhã para ganhar mais!'
  if (motivo === 'limite_mensal') return `Você chegou ao limite de ${formatPatinhas(PATINHAS_RULES.monthlyCap)} Patinhas do mês. Elas voltam a render no mês que vem.`
  return 'Não conseguimos contar as Patinhas desse banho.'
}
