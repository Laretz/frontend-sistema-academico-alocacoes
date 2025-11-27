"use client"

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

import { reservasSalaService } from '@/services/reservas-sala'
import { Sala, Horario, CreateReservaSalaRequest, ReservasSalaListResponse } from '@/types/entities'
import { api } from '@/lib/api'
import { alocacaoService } from '@/services/entities'
import { GradeHorariosSala } from '@/components/GradeHorariosSala'

function formatDateYYYYMMDD(date: Date | undefined): string | undefined {
  if (!date) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isDateAfterOrEqual(a?: Date, b?: Date): boolean {
  if (!a || !b) return false
  const aStr = formatDateYYYYMMDD(a)!
  const bStr = formatDateYYYYMMDD(b)!
  return aStr >= bStr
}

function getDiaSemanaKey(date?: Date): string | undefined {
  if (!date) return undefined
  // Usa UTC para evitar deslocamentos por fuso na virada de dia
  const utcMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const d = utcMidnight.getUTCDay() // 0-Domingo, 1-Segunda, ... 6-Sábado
  const map: Record<number, string> = {
    0: 'DOMINGO',
    1: 'SEGUNDA',
    2: 'TERCA',
    3: 'QUARTA',
    4: 'QUINTA',
    5: 'SEXTA',
    6: 'SABADO',
  }
  return map[d]
}

interface ReservaSalaDialogProps {
  sala: Sala
  triggerLabel?: string
  onSuccess?: () => void
}

export function ReservaSalaDialog({ sala, triggerLabel = 'Reservar', onSuccess }: ReservaSalaDialogProps) {
  const [open, setOpen] = useState(false)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [regime, setRegime] = useState<'SUPERIOR' | 'TECNICO' | 'todos'>('todos')

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [horarioId, setHorarioId] = useState<string>('')
  const [titulo, setTitulo] = useState<string>('')
  const [descricao, setDescricao] = useState<string>('')
  const [recorrente, setRecorrente] = useState<boolean>(false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasConflict, setHasConflict] = useState<boolean>(false)
  const [conflictDetails, setConflictDetails] = useState<string>('')

  // Carregar horários para seleção
  useEffect(() => {
    async function fetchHorarios() {
      try {
        const resp = await api.get<{ horarios: Horario[] }>('/horarios', {
          params: regime === 'todos' ? undefined : { regime }
        })
        setHorarios(resp.data.horarios || [])
      } catch (error: unknown) {
        console.error('Erro ao carregar horários', error)
        toast.error('Não foi possível carregar horários')
      }
    }
    if (open) fetchHorarios()
  }, [open, regime])

  // Filtrar horários pelo dia correspondente à data selecionada
  const diaKey = useMemo(() => getDiaSemanaKey(selectedDate), [selectedDate])
  const horariosFiltrados = useMemo(
    () => horarios.filter((h) => (diaKey ? h.dia_semana === diaKey : true)),
    [horarios, diaKey]
  )
  // Se horário selecionado sair do filtro ao mudar a data, limpar seleção
  useEffect(() => {
    if (horarioId && !horariosFiltrados.some((h) => h.id === horarioId)) {
      setHorarioId('')
    }
  }, [horariosFiltrados, horarioId])

  // Pré-checagem de conflitos (reservas existentes e alocações fixas)
  useEffect(() => {
    async function checkConflicts() {
      setHasConflict(false)
      setConflictDetails('')
      if (!selectedDate || !horarioId) return

      const diaKey = getDiaSemanaKey(selectedDate)
      const selected = horarios.find(h => h.id === horarioId)

      // Validação: data escolhida deve corresponder ao dia_semana do horário
      if (diaKey && selected?.dia_semana && diaKey !== selected.dia_semana) {
        setHasConflict(true)
        setConflictDetails(`Data selecionada (${diaKey}) não corresponde ao dia do horário (${selected.dia_semana}).`)
        return
      }

      const dateStr = formatDateYYYYMMDD(selectedDate)!

      // 1) Checar reservas existentes no mesmo sala+horário+data
      try {
        const reservasResp: ReservasSalaListResponse = await reservasSalaService.list({ salaId: sala.id, horarioId, dateFrom: dateStr, dateTo: dateStr })
        const reservasAtivas = (reservasResp.reservas || []).filter(r => r.status === 'ATIVA')
        if (reservasAtivas.length > 0) {
          setHasConflict(true)
          setConflictDetails('Já existe reserva ativa neste horário e data.')
          return
        }
      } catch (err) {
        console.warn('Falha ao checar reservas para conflito', err)
      }

      // 2) Checar alocação fixa na grade da sala
      try {
        const resp = await api.get(`/salas/${sala.id}/grade-horarios`)
        const gradeObj = resp.data?.grade || resp.data?.gradeHorarios || resp.data
        const codigo = selected?.codigo
        if (diaKey && codigo) {
          const slot = gradeObj?.[diaKey]?.[codigo]
          if (slot) {
            setHasConflict(true)
            setConflictDetails('Há alocação de aula fixa neste horário.')
            return
          }
        }
      } catch (err) {
        console.warn('Falha ao checar alocação fixa da sala', err)
      }
    }
    checkConflicts()
  }, [selectedDate, horarioId, sala.id, horarios])

  const isValid = useMemo(() => {
    const baseValid = !!selectedDate && !!horarioId && !!titulo.trim()
    const recurrenceValid = !recorrente || (!!recurrenceEndDate && isDateAfterOrEqual(recurrenceEndDate, selectedDate))
    return baseValid && recurrenceValid && !hasConflict
  }, [selectedDate, horarioId, recorrente, recurrenceEndDate, titulo, hasConflict])

  async function handleSubmit() {
    if (!isValid) {
      if (hasConflict) {
        toast.warning(conflictDetails || 'Conflito detectado, ajuste a seleção antes de continuar')
      } else if (!selectedDate || !horarioId || !titulo.trim()) {
        toast.warning('Selecione data, horário e informe um título')
      } else if (recorrente && recurrenceEndDate && !isDateAfterOrEqual(recurrenceEndDate, selectedDate)) {
        toast.warning('O fim da recorrência deve ser igual ou posterior à data inicial')
      } else {
        toast.warning('Preencha os campos obrigatórios')
      }
      return
    }

    const payload: CreateReservaSalaRequest = {
      salaId: sala.id,
      horarioId,
      date: formatDateYYYYMMDD(selectedDate!)!,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || undefined,
      ...(recorrente
        ? { recurrenceRule: 'WEEKLY', recurrenceEnd: formatDateYYYYMMDD(recurrenceEndDate!) }
        : {}),
    }

    setIsSubmitting(true)
    try {
      const { reservas } = await reservasSalaService.create(payload)
      toast.success('Reserva criada com sucesso')
      setOpen(false)
      setSelectedDate(undefined)
      setHorarioId('')
      setTitulo('')
      setDescricao('')
      setRecorrente(false)
      setRecurrenceEndDate(undefined)
      onSuccess?.()
    } catch (error: any) {
      console.error('Erro ao criar reserva', error)
      const backendData = error?.response?.data
      const message = backendData?.message || backendData?.error || backendData?.errors?.[0]?.message || 'Falha ao criar reserva'
      if (backendData?.issues) {
        const details = Array.isArray(backendData.issues) ? backendData.issues.map((i: any) => i.message).join('; ') : ''
        toast.error(`${message}. ${details}`)
      } else {
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Reservar sala: {sala.nome}</DialogTitle>
          <DialogDescription>
            Preencha os campos para criar uma reserva. O título é obrigatório. Opcionalmente, habilite recorrente para repetir semanalmente até a data final.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Reunião do projeto" />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes da reserva" />
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <div className="space-y-2">
            <Label>Regime</Label>
            <Select value={regime} onValueChange={(value) => setRegime(value as 'SUPERIOR' | 'TECNICO' | 'todos')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="SUPERIOR">Superior</SelectItem>
                <SelectItem value="TECNICO">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Horário</Label>
            <Select onValueChange={(value) => setHorarioId(value)} value={horarioId ?? undefined}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {horariosFiltrados.map((h) => (
                  <SelectItem
                    key={h.id}
                    value={h.id}
                  >
                    {`${h.codigo}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div></div>
        </div>

          {hasConflict && (
            <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-destructive text-sm">
              {conflictDetails}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="recorrente" checked={recorrente} onCheckedChange={(v) => setRecorrente(Boolean(v))} />
              <Label htmlFor="recorrente">Recorrente (semanal)</Label>
            </div>
            {recorrente && (
              <div className="space-y-2">
                <Label>Fim da recorrência</Label>
                <DatePicker date={recurrenceEndDate} onDateChange={setRecurrenceEndDate} />
                <p className="text-xs text-muted-foreground">As reservas serão geradas semanalmente até a data informada.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-2">
            <GradeHorariosSala sala={sala} trigger={<Button variant="outline" size="sm">Ver grade da sala</Button>} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Confirmar reserva'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}