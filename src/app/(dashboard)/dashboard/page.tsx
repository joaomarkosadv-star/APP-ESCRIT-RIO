export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Visão Geral</h2>
        <p className="text-gray-400 text-sm mt-0.5">Bem-vindo ao sistema interno do escritório.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Processos Ativos', value: '—' },
          { label: 'Tarefas Pendentes', value: '—' },
          { label: 'Clientes', value: '—' },
          { label: 'Receita do Mês', value: '—' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-700 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder de conteúdo futuro */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-400 text-sm text-center">
          Os dados reais do escritório aparecerão aqui após a importação da planilha.
        </p>
      </div>
    </div>
  )
}
