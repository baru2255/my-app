import { useMemo, useState } from 'react'
import './App.css'

type Tab = 'home' | 'fuel' | 'maintenance' | 'custom' | 'specs'

type FuelLog = {
  date: string
  odometer: number
  distance: number
  liters: number
  price: number
}

type FuelForm = {
  date: string
  odometer: string
  liters: string
  price: string
  unitPrice: string
  memo: string
}

const initialFuelLogs: FuelLog[] = [
  { date: '2026.05.12', odometer: 42180, distance: 384, liters: 28.4, price: 4932 },
  { date: '2026.04.26', odometer: 41796, distance: 421, liters: 31.1, price: 5349 },
  { date: '2026.04.08', odometer: 41375, distance: 356, liters: 26.8, price: 4556 },
]

const maintenanceLogs = [
  { date: '2026.05.02', title: 'エンジンオイル交換', odometer: 42180, cost: '8,900円' },
  { date: '2026.03.18', title: 'タイヤローテーション', odometer: 40940, cost: '3,300円' },
  { date: '2026.01.09', title: 'バッテリー点検', odometer: 38620, cost: '0円' },
]

const serviceSchedule = [
  { name: 'エンジンオイル', nextOdometer: 45180, interval: '3,000 kmごと' },
  { name: 'オイルフィルター', nextOdometer: 48180, interval: '6,000 kmごと' },
  { name: 'ミッションオイル', nextOdometer: 60180, interval: '20,000 kmごと' },
]

const customLogs = [
  { title: 'ホイール交換', detail: '17インチ / マットブラック', status: '完了' },
  { title: '車高調セッティング', detail: '街乗り寄り、減衰 12 段', status: '調整中' },
  { title: 'フロントリップ', detail: '塗装見積もり待ち', status: '予定' },
]

const specs = [
  ['車名 / グレード', 'トヨタ 86 GT'],
  ['型式', '4BA-ZN6'],
  ['初年度登録', '2020年12月'],
  ['ボディタイプ', 'クーペ / 2ドア / 4名'],
  ['駆動方式', 'FR'],
  ['トランスミッション', '6速マニュアル'],
  ['エンジン型式', 'FA20'],
  ['種類', '水平対向4気筒'],
  ['総排気量', '1,998 cc'],
  ['最高出力', '207 ps（152 kW）/ 7,000 rpm'],
  ['最大トルク', '21.6 kgf・m（212 N・m）/ 6,400-6,800 rpm'],
  ['使用燃料', '無鉛プレミアムガソリン'],
  ['燃料タンク', '50 L'],
  ['全長×全幅×全高', '4,240×1,775×1,320 mm'],
  ['ホイールベース', '2,570 mm'],
  ['車両重量', '1,250 kg'],
  ['タイヤ', '215/45R17 87W'],
  ['WLTC燃費', '12.8 km/L'],
  ['最小回転半径', '5.4 m'],
]

const formatDate = (value: string) => value.replaceAll('-', '.')

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false)
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs)
  const [fuelForm, setFuelForm] = useState<FuelForm>({
    date: '2026-05-14',
    odometer: '',
    liters: '',
    price: '',
    unitPrice: '',
    memo: '',
  })

  const currentOdometer = fuelLogs[0].odometer
  const lastFuelLog = fuelLogs[0]

  const averageFuel = useMemo(() => {
    const totalDistance = fuelLogs.reduce((sum, log) => sum + log.distance, 0)
    const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0)
    return totalDistance / totalLiters
  }, [fuelLogs])

  const formOdometer = Number(fuelForm.odometer)
  const formLiters = Number(fuelForm.liters)
  const formPrice = Number(fuelForm.price)
  const formInputUnitPrice = Number(fuelForm.unitPrice)
  const calculatedPrice =
    formPrice > 0 ? formPrice : formLiters > 0 && formInputUnitPrice > 0 ? formLiters * formInputUnitPrice : 0
  const formDistance = formOdometer > lastFuelLog.odometer ? formOdometer - lastFuelLog.odometer : 0
  const formEfficiency = formDistance > 0 && formLiters > 0 ? formDistance / formLiters : 0
  const formUnitPrice =
    formLiters > 0 && calculatedPrice > 0
      ? calculatedPrice / formLiters
      : formInputUnitPrice > 0
        ? formInputUnitPrice
        : 0
  const canSaveFuel = formDistance > 0 && formLiters > 0 && calculatedPrice > 0 && fuelForm.date !== ''

  const saveFuelLog = () => {
    if (!canSaveFuel) {
      return
    }

    setFuelLogs((logs) => [
      {
        date: formatDate(fuelForm.date),
        odometer: formOdometer,
        distance: formDistance,
        liters: formLiters,
        price: Math.round(calculatedPrice),
      },
      ...logs,
    ])
    setFuelForm({
      date: '2026-05-14',
      odometer: '',
      liters: '',
      price: '',
      unitPrice: '',
      memo: '',
    })
    setIsFuelFormOpen(false)
  }

  const renderPanel = () => {
    if (activeTab === 'fuel') {
      return (
        <section className="panel fuel-panel">
          <div className="fuel-title-row">
            <PanelTitle eyebrow="Fuel log" title="燃費記録" />
            <button type="button" onClick={() => setIsFuelFormOpen(true)}>
              +
            </button>
          </div>
          <div className="metric-grid">
            <Metric label="平均燃費" value={`${averageFuel.toFixed(1)} km/L`} />
            <Metric label="記録件数" value={`${fuelLogs.length} 件`} />
          </div>
          <div className="list">
            {fuelLogs.map((log) => (
              <article className="log-row" key={`${log.date}-${log.odometer}`}>
                <div>
                  <span>{log.date}</span>
                  <strong>{(log.distance / log.liters).toFixed(1)} km/L</strong>
                </div>
                <p>
                  ODO {log.odometer.toLocaleString()} km / {log.distance} km / {log.liters} L /
                  {log.price.toLocaleString()}円
                </p>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="floating-add"
            aria-label="給油記録を追加"
            onClick={() => setIsFuelFormOpen(true)}
          >
            +
          </button>

          {isFuelFormOpen && (
            <div className="sheet-backdrop" role="presentation">
              <FuelEntryForm
                form={fuelForm}
                previousOdometer={lastFuelLog.odometer}
                distance={formDistance}
                efficiency={formEfficiency}
                unitPrice={formUnitPrice}
                calculatedPrice={calculatedPrice}
                canSave={canSaveFuel}
                onChange={setFuelForm}
                onSave={saveFuelLog}
                onClose={() => setIsFuelFormOpen(false)}
              />
            </div>
          )}
        </section>
      )
    }

    if (activeTab === 'maintenance') {
      return (
        <section className="panel">
          <PanelTitle eyebrow="Garage note" title="整備記録" />
          <div className="service-list">
            {serviceSchedule.map((item) => (
              <ServiceCard key={item.name} currentOdometer={currentOdometer} {...item} />
            ))}
          </div>
          <div className="timeline">
            {maintenanceLogs.map((log) => (
              <article className="timeline-item" key={log.title}>
                <span>{log.date}</span>
                <h3>{log.title}</h3>
                <p>
                  ODO {log.odometer.toLocaleString()} km / {log.cost}
                </p>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (activeTab === 'custom') {
      return (
        <section className="panel">
          <PanelTitle eyebrow="Build list" title="カスタム記録" />
          <div className="custom-list">
            {customLogs.map((log) => (
              <article className="custom-card" key={log.title}>
                <div>
                  <strong>{log.title}</strong>
                  <p>{log.detail}</p>
                </div>
                <span>{log.status}</span>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (activeTab === 'specs') {
      return (
        <section className="panel">
          <PanelTitle eyebrow="Vehicle data" title="諸元表" />
          <p className="source-note">4BA-ZN6 / GT / 6MT（初年度登録 2020年12月）</p>
          <dl className="spec-table">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    }

    return (
      <section className="panel home-panel">
        <div className="hero-card">
          <img src="/20210202_02_02_W610_H407.jpg" alt="Vehicle emblem" />
          <div>
            <p>Toyota 86 GT</p>
            <h1>ZN6 Drive Log</h1>
            <span>4BA-ZN6 / 6MT / 初年度登録 2020年12月</span>
            <span>現在ODO {currentOdometer.toLocaleString()} km</span>
          </div>
        </div>

        <section className="status-card">
          <div className="panel-title compact">
            <span>Last fuel status</span>
            <h2>前回給油時ステータス</h2>
          </div>
          <div className="metric-grid">
            <Metric label="燃費" value={`${(lastFuelLog.distance / lastFuelLog.liters).toFixed(1)} km/L`} />
            <Metric label="ODO" value={`${lastFuelLog.odometer.toLocaleString()} km`} />
            <Metric label="給油日" value={lastFuelLog.date} />
            <Metric label="給油量" value={`${lastFuelLog.liters} L`} />
          </div>
        </section>

        <section className="status-card">
          <div className="panel-title compact">
            <span>Service countdown</span>
            <h2>次回交換まで</h2>
          </div>
          <div className="service-list">
            {serviceSchedule.map((item) => (
              <ServiceCard key={item.name} currentOdometer={currentOdometer} {...item} />
            ))}
          </div>
        </section>
      </section>
    )
  }

  return (
    <main className="app-shell">
      <section className="phone">
        <header className="status-bar">
          <span>15:44</span>
          <span>5G 100%</span>
        </header>

        <div className="app-header">
          <div>
            <span>Garage</span>
            <strong>車両ログ</strong>
          </div>
          <button
            type="button"
            aria-label="Add fuel record"
            onClick={() => {
              setActiveTab('fuel')
              setIsFuelFormOpen(true)
            }}
          >
            +
          </button>
        </div>

        <div className="content">{renderPanel()}</div>

        <nav className="tab-bar" aria-label="Main navigation">
          <TabButton id="home" label="ホーム" activeTab={activeTab} onSelect={setActiveTab} />
          <TabButton id="fuel" label="燃費" activeTab={activeTab} onSelect={setActiveTab} />
          <TabButton
            id="maintenance"
            label="整備"
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
          <TabButton id="custom" label="カスタム" activeTab={activeTab} onSelect={setActiveTab} />
          <TabButton id="specs" label="諸元" activeTab={activeTab} onSelect={setActiveTab} />
        </nav>
      </section>
    </main>
  )
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="panel-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function FuelEntryForm({
  form,
  previousOdometer,
  distance,
  efficiency,
  unitPrice,
  calculatedPrice,
  canSave,
  onChange,
  onSave,
  onClose,
}: {
  form: FuelForm
  previousOdometer: number
  distance: number
  efficiency: number
  unitPrice: number
  calculatedPrice: number
  canSave: boolean
  onChange: (form: FuelForm) => void
  onSave: () => void
  onClose: () => void
}) {
  const update = (key: keyof FuelForm, value: string) => {
    onChange({ ...form, [key]: value })
  }

  return (
    <section className="entry-card" aria-label="給油記録入力">
      <div className="sheet-header">
        <div className="panel-title compact">
          <span>New fuel record</span>
          <h2>給油記録を追加</h2>
        </div>
        <button type="button" aria-label="閉じる" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="form-grid">
        <label>
          給油日
          <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
        </label>
        <label>
          ODO
          <input
            type="number"
            inputMode="numeric"
            placeholder="例: 42560"
            value={form.odometer}
            onChange={(event) => update('odometer', event.target.value)}
          />
        </label>
        <label>
          給油量
          <input
            type="number"
            inputMode="decimal"
            placeholder="例: 31.2"
            value={form.liters}
            onChange={(event) => update('liters', event.target.value)}
          />
        </label>
        <label>
          支払金額
          <input
            type="number"
            inputMode="numeric"
            placeholder="例: 5680"
            value={form.price}
            onChange={(event) => update('price', event.target.value)}
          />
        </label>
        <label>
          単価
          <input
            type="number"
            inputMode="decimal"
            placeholder="例: 182"
            value={form.unitPrice}
            onChange={(event) => update('unitPrice', event.target.value)}
          />
        </label>
      </div>

      <label className="memo-field">
        メモ
        <textarea
          placeholder="給油スタンド、ハイオク単価、走行メモなど"
          value={form.memo}
          onChange={(event) => update('memo', event.target.value)}
        />
      </label>

      <div className="preview-grid">
        <Metric label="前回ODO" value={`${previousOdometer.toLocaleString()} km`} />
        <Metric label="走行距離" value={distance > 0 ? `${distance.toLocaleString()} km` : '-'} />
        <Metric label="燃費" value={efficiency > 0 ? `${efficiency.toFixed(1)} km/L` : '-'} />
        <Metric label="単価" value={unitPrice > 0 ? `${unitPrice.toFixed(0)} 円/L` : '-'} />
        <Metric
          label="支払金額"
          value={calculatedPrice > 0 ? `${Math.round(calculatedPrice).toLocaleString()} 円` : '-'}
        />
      </div>

      <button type="button" className="save-button" disabled={!canSave} onClick={onSave}>
        記録する
      </button>
    </section>
  )
}

function ServiceCard({
  name,
  nextOdometer,
  interval,
  currentOdometer,
}: {
  name: string
  nextOdometer: number
  interval: string
  currentOdometer: number
}) {
  const remaining = nextOdometer - currentOdometer

  return (
    <article className="service-card">
      <div>
        <span>{interval}</span>
        <strong>{name}</strong>
      </div>
      <div>
        <b>{remaining.toLocaleString()} km</b>
        <small>ODO {nextOdometer.toLocaleString()} km</small>
      </div>
    </article>
  )
}

function TabButton({
  id,
  label,
  activeTab,
  onSelect,
}: {
  id: Tab
  label: string
  activeTab: Tab
  onSelect: (tab: Tab) => void
}) {
  return (
    <button
      type="button"
      className={activeTab === id ? 'active' : ''}
      onClick={() => onSelect(id)}
      aria-current={activeTab === id ? 'page' : undefined}
    >
      <span>{label.slice(0, 1)}</span>
      {label}
    </button>
  )
}

export default App
