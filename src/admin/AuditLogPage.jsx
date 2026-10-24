import { useMemo, useState } from 'react'
import { getAudit } from '../services/listings.js'
import './AuditLogPage.css'

const PAGE_SIZE = 20

const DATE_FORMAT = { dateStyle: 'medium', timeStyle: 'short' }

// action text se badge ka type nikalta he
const actionTone = (action = '') => {
    const a = String(action).toLowerCase()
    if (a.includes('approve')) return 'approve'
    if (a.includes('reject')) return 'reject'
    if (a.includes('suspend')) return 'suspend'
    return 'other'
}

const formatDate = (value) => {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('en-IN', DATE_FORMAT)
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

const exportCsv = (rows) => {
    const head = ['Time', 'Admin', 'Action', 'Target', 'Reason']
    const lines = rows.map((l) =>
        [formatDate(l.date), l.admin, l.action, l.target, l.reason].map(csvCell).join(',')
    )
    // BOM taaki Excel me Hindi/Unicode sahi dikhe
    const csv = '\uFEFF' + [head.map(csvCell).join(','), ...lines].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

const AuditLogPage = () => {
    // saare logs ek baar read karo
    const allLogs = useMemo(() => [...getAudit()], [])

    const [search, setSearch] = useState('')
    const [admin, setAdmin] = useState('')
    const [action, setAction] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [newestFirst, setNewestFirst] = useState(true)
    const [page, setPage] = useState(1)
    const [expanded, setExpanded] = useState(() => new Set())

    const admins = useMemo(
        () => [...new Set(allLogs.map((l) => l.admin).filter(Boolean))].sort(),
        [allLogs]
    )
    const actions = useMemo(
        () => [...new Set(allLogs.map((l) => l.action).filter(Boolean))].sort(),
        [allLogs]
    )

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : null
        const toMs = to ? new Date(`${to}T23:59:59.999`).getTime() : null

        return allLogs
            .filter((l) => {
                const t = new Date(l.date).getTime()
                if (admin && l.admin !== admin) return false
                if (action && l.action !== action) return false
                if (fromMs !== null && t < fromMs) return false
                if (toMs !== null && t > toMs) return false
                if (q && !String(l.target ?? '').toLowerCase().includes(q)) return false
                return true
            })
            .sort((a, b) => {
                const diff = new Date(b.date) - new Date(a.date)
                return newestFirst ? diff : -diff
            })
    }, [allLogs, search, admin, action, from, to, newestFirst])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    const pageRows = filtered.slice(start, start + PAGE_SIZE)

    const hasFilters = Boolean(search || admin || action || from || to)

    // filter badalte hi page 1 pe wapas
    const withReset = (setter) => (e) => {
        setter(e.target.value)
        setPage(1)
    }

    const clearFilters = () => {
        setSearch('')
        setAdmin('')
        setAction('')
        setFrom('')
        setTo('')
        setPage(1)
    }

    const toggleReason = (id) =>
        setExpanded((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    return (
        <div className="audit-page">
            <div className="audit-inner">
                <header className="audit-head">
                    <div>
                        <h2 className="audit-title">Audit Log</h2>
                        <p className="audit-sub">Admin actions ka record: kisne, kya, kab aur kyun.</p>
                    </div>
                    <div className="audit-head-right">
                        {allLogs.length > 0 && (
                            <span className="audit-count">
                                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                                {hasFilters && ` / ${allLogs.length}`}
                            </span>
                        )}
                        <button
                            type="button"
                            className="audit-btn"
                            onClick={() => exportCsv(filtered)}
                            disabled={filtered.length === 0}
                        >
                            Export CSV
                        </button>
                    </div>
                </header>

                {allLogs.length === 0 ? (
                    <div className="audit-empty">
                        <p className="audit-empty-title">Abhi koi admin action nahi hua.</p>
                        <p className="audit-empty-hint">
                            Listing approve, reject ya user suspend hote hi yahan record dikhega.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="audit-filters" role="search" aria-label="Audit log filters">
                            <label className="audit-field audit-field-wide">
                                <span>Target search</span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={withReset(setSearch)}
                                    placeholder="Listing ya user ka naam"
                                />
                            </label>
                            <label className="audit-field">
                                <span>Admin</span>
                                <select value={admin} onChange={withReset(setAdmin)}>
                                    <option value="">Sab</option>
                                    {admins.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="audit-field">
                                <span>Action</span>
                                <select value={action} onChange={withReset(setAction)}>
                                    <option value="">Sab</option>
                                    {actions.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="audit-field">
                                <span>From</span>
                                <input type="date" value={from} max={to || undefined} onChange={withReset(setFrom)} />
                            </label>
                            <label className="audit-field">
                                <span>To</span>
                                <input type="date" value={to} min={from || undefined} onChange={withReset(setTo)} />
                            </label>
                            {hasFilters && (
                                <button type="button" className="audit-btn audit-btn-ghost" onClick={clearFilters}>
                                    Filters hatao
                                </button>
                            )}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="audit-empty">
                                <p className="audit-empty-title">In filters se koi entry nahi mili.</p>
                                <p className="audit-empty-hint">Filters badlo ya hata do.</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="audit-table-wrap"
                                    role="region"
                                    aria-label="Audit log table"
                                    tabIndex={0}
                                >
                                    <table className="audit-table">
                                        <thead>
                                        <tr>
                                            <th scope="col" aria-sort={newestFirst ? 'descending' : 'ascending'}>
                                                <button
                                                    type="button"
                                                    className="audit-sort"
                                                    onClick={() => setNewestFirst((v) => !v)}
                                                    title="Time ke hisaab se sort badlo"
                                                >
                                                    Time {newestFirst ? '\u2193' : '\u2191'}
                                                </button>
                                            </th>
                                            <th scope="col">Admin</th>
                                            <th scope="col">Action</th>
                                            <th scope="col">Target</th>
                                            <th scope="col">Reason</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {pageRows.map((log) => {
                                            const open = expanded.has(log.id)
                                            const longReason = String(log.reason ?? '').length > 60
                                            return (
                                                <tr key={log.id}>
                                                    <td className="audit-time">{formatDate(log.date)}</td>
                                                    <td className="audit-admin">{log.admin}</td>
                                                    <td>
                                                            <span className={`audit-action audit-action-${actionTone(log.action)}`}>
                                                                {log.action}
                                                            </span>
                                                    </td>
                                                    <td>{log.target}</td>
                                                    <td className="audit-reason">
                                                            <span
                                                                className={open ? 'audit-reason-text open' : 'audit-reason-text'}
                                                                title={open ? undefined : log.reason}
                                                            >
                                                                {log.reason || '-'}
                                                            </span>
                                                        {longReason && (
                                                            <button
                                                                type="button"
                                                                className="audit-more"
                                                                aria-expanded={open}
                                                                onClick={() => toggleReason(log.id)}
                                                            >
                                                                {open ? 'Kam dikhao' : 'Poora dekho'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                </div>

                                <nav className="audit-pager" aria-label="Pagination">
                                    <span className="audit-pager-info">
                                        {start + 1}-{Math.min(start + PAGE_SIZE, filtered.length)} / {filtered.length}
                                    </span>
                                    <div className="audit-pager-btns">
                                        <button
                                            type="button"
                                            className="audit-btn"
                                            onClick={() => setPage(safePage - 1)}
                                            disabled={safePage <= 1}
                                        >
                                            Pehle wala
                                        </button>
                                        <span className="audit-pager-page">
                                            Page {safePage} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            className="audit-btn"
                                            onClick={() => setPage(safePage + 1)}
                                            disabled={safePage >= totalPages}
                                        >
                                            Agla
                                        </button>
                                    </div>
                                </nav>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AuditLogPage