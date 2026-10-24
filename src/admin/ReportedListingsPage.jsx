import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getReports, closeReport, getListing, updateListing, addAudit } from '../services/listings.js'
import './ReportedListingsPage.css'

const ReportedListingsPage = () => {
    const { user } = useAuth()
    const [reports, setReports] = useState(() => getReports())
    const [reasons, setReasons] = useState({})
    const [error, setError] = useState('')

    const refresh = () => setReports(getReports())
    const setReason = (id, v) => setReasons(r => ({ ...r, [id]: v }))

    const getReason = (id) => {
        const r = (reasons[id] || '').trim()
        if (!r) { setError('Reason likhna zaroori hai.'); return null }
        setError('')
        return r
    }

    const closeOnly = (report) => {
        const reason = getReason(report.id)
        if (!reason) return
        closeReport(report.id)
        addAudit({ admin: user.email, action: 'Report closed', target: report.listingTitle, reason })
        refresh()
    }

    const hideListing = (report) => {
        const reason = getReason(report.id)
        if (!reason) return
        if (getListing(report.listingId)) updateListing(report.listingId, { status: 'Archived' })
        closeReport(report.id)
        addAudit({ admin: user.email, action: 'Reported listing hidden', target: report.listingTitle, reason })
        refresh()
    }

    const openCount = reports.filter((r) => r.status === 'Open').length

    return (
        <div className="reports-page">
            <div className="reports-inner">
                <header className="reports-head">
                    <div>
                        <h2 className="reports-title">Reported Listings</h2>
                        <p className="reports-sub">Buyers ke reports dekho, listing hide karo ya report close karo.</p>
                    </div>
                    {openCount > 0 && <span className="reports-count">{openCount} open</span>}
                </header>

                {error && <p className="reports-error" role="alert">{error}</p>}

                {reports.length > 0 ? (
                    <ul className="reports-list">
                        {reports.map((report) => (
                            <li
                                key={report.id}
                                className={`reports-item${report.status === 'Open' ? '' : ' reports-item--done'}`}
                            >
                                <div className="reports-item-head">
                                    <h4 className="reports-item-title">{report.listingTitle}</h4>
                                    <span className={`reports-status${report.status === 'Open' ? ' reports-status--open' : ''}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <p className="reports-meta">
                                    Reported by buyer • {new Date(report.date).toLocaleString()}
                                </p>
                                <p className="reports-why">
                                    <strong>Reason:</strong> {report.reason}
                                </p>

                                {report.status === 'Open' && (
                                    <>
                                        <input
                                            className="reports-input"
                                            aria-label={`Admin reason for ${report.listingTitle}`}
                                            placeholder="Admin ka reason (zaroori)"
                                            value={reasons[report.id] || ''}
                                            onChange={(e) => setReason(report.id, e.target.value)}
                                        />
                                        <div className="reports-actions">
                                            <button onClick={() => hideListing(report)} className="reports-btn reports-btn--hide">
                                                Listing hide karo
                                            </button>
                                            <button onClick={() => closeOnly(report)} className="reports-btn reports-btn--close">
                                                Close Report
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="reports-empty">
                        <p className="reports-empty-title">No reported listings found.</p>
                        <p className="reports-empty-hint">Buyer koi listing report karega to yahan dikhegi.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReportedListingsPage