
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const EnquiriesInbox = () => {
    const { user } = useAuth()
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(false)
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [notice, setNotice] = useState('')

    useEffect(() => {
        if (!user) {
            setEnquiries([])
            return
        }

        // Yahan apni enquiry service se seller ki enquiries fetch karo.
        // Abhi service/API available nahi hai, isliye list empty rahegi.
        setLoading(false)
    }, [user])

    const handleReply = (enquiry) => {
        setNotice('')
        setReplyMessage('')
        setReplyingTo(enquiry.id)
    }

    const submitReply = (e) => {
        e.preventDefault()

        if (!replyMessage.trim()) {
            setNotice('Reply message likho.')
            return
        }

        // Actual reply bhejne ke liye backend/API integration zaroori hai.
        setNotice(
            'Reply abhi send nahi hua. Enquiry reply service ko connect karna hoga.'
        )
    }

    const styles = `
        .vintora-inbox {
            min-height: 100vh;
            padding: 48px 20px 64px;
            background: #f8f5ed;
            color: #183d36;
            box-sizing: border-box;
        }

        .vintora-inbox * {
            box-sizing: border-box;
        }

        .vintora-inbox-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
        }

        .vintora-inbox-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 24px;
            border-bottom: 1px solid #ded8c9;
        }

        .vintora-inbox-eyebrow {
            margin: 0 0 8px;
            color: #a17a32;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2.2px;
        }

        .vintora-inbox-header h1 {
            margin: 0;
            color: #183d36;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(30px, 5vw, 42px);
            font-weight: 500;
            line-height: 1.15;
        }

        .vintora-inbox-subtitle {
            margin: 10px 0 0;
            color: #72766b;
            font-size: 14px;
            line-height: 1.7;
        }

        .vintora-inbox-count {
            flex-shrink: 0;
            padding: 9px 14px;
            border: 1px solid #d7c49a;
            border-radius: 30px;
            background: #f0e7d1;
            color: #765b25;
            font-size: 12px;
            font-weight: 700;
        }

        .vintora-inbox-notice {
            margin: 0 0 20px;
            padding: 13px 16px;
            border: 1px solid #d7c49a;
            border-radius: 10px;
            background: #fffaf0;
            color: #725523;
            font-size: 14px;
            line-height: 1.6;
        }

        .vintora-enquiry-list {
            display: grid;
            gap: 18px;
        }

        .vintora-enquiry-card {
            padding: 24px;
            border: 1px solid #e4dfd2;
            border-radius: 16px;
            background: #fffefa;
            box-shadow: 0 6px 22px rgba(24, 61, 54, 0.045);
            transition: border-color 180ms ease, transform 180ms ease,
                box-shadow 180ms ease;
        }

        .vintora-enquiry-card:hover {
            border-color: #cbb77f;
            box-shadow: 0 10px 28px rgba(24, 61, 54, 0.08);
            transform: translateY(-2px);
        }

        .vintora-enquiry-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 15px;
        }

        .vintora-enquiry-label {
            margin: 0 0 7px;
            color: #a17a32;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.6px;
            text-transform: uppercase;
        }

        .vintora-enquiry-title {
            margin: 0;
            color: #183d36;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 21px;
            font-weight: 600;
            overflow-wrap: anywhere;
        }

        .vintora-enquiry-status {
            flex-shrink: 0;
            padding: 6px 10px;
            border-radius: 30px;
            background: #e6eee8;
            color: #285c48;
            font-size: 11px;
            font-weight: 700;
        }

        .vintora-enquiry-message {
            margin: 0;
            color: #5e665e;
            font-size: 14px;
            line-height: 1.8;
            overflow-wrap: anywhere;
            white-space: pre-wrap;
        }

        .vintora-enquiry-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 18px;
            margin-top: 16px;
            color: #888778;
            font-size: 12px;
        }

        .vintora-inbox-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }

        .vintora-inbox-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            padding: 10px 18px;
            border: 1px solid transparent;
            border-radius: 8px;
            font: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: background 180ms ease, color 180ms ease,
                border-color 180ms ease;
        }

        .vintora-inbox-btn--primary {
            background: #183d36;
            color: #fffaf0;
        }

        .vintora-inbox-btn--primary:hover {
            background: #28584d;
        }

        .vintora-inbox-btn--outline {
            border-color: #d8d2c3;
            background: transparent;
            color: #183d36;
        }

        .vintora-inbox-btn--outline:hover {
            border-color: #a17a32;
            background: #f8f1e2;
        }

        .vintora-inbox-btn:focus-visible,
        .vintora-inbox-input:focus-visible,
        .vintora-inbox-textarea:focus-visible {
            outline: 3px solid #c9ad68;
            outline-offset: 3px;
        }

        .vintora-reply-form {
            display: grid;
            gap: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e7e1d4;
        }

        .vintora-reply-form label {
            color: #183d36;
            font-size: 13px;
            font-weight: 700;
        }

        .vintora-inbox-textarea {
            width: 100%;
            min-height: 120px;
            padding: 13px 14px;
            resize: vertical;
            border: 1px solid #d8d2c3;
            border-radius: 9px;
            background: #fff;
            color: #183d36;
            font: inherit;
            font-size: 14px;
            line-height: 1.6;
        }

        .vintora-reply-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 10px;
        }

        .vintora-inbox-empty {
            padding: 54px 24px;
            border: 1px dashed #d6cdb9;
            border-radius: 16px;
            background: rgba(255, 254, 250, 0.75);
            text-align: center;
        }

        .vintora-inbox-empty-icon {
            display: grid;
            width: 62px;
            height: 62px;
            place-items: center;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: #e8eee7;
            color: #28584d;
            font-size: 26px;
        }

        .vintora-inbox-empty h2 {
            margin: 0 0 10px;
            color: #183d36;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 24px;
            font-weight: 500;
        }

        .vintora-inbox-empty p {
            max-width: 390px;
            margin: 0 auto;
            color: #72766b;
            font-size: 14px;
            line-height: 1.8;
        }

        .vintora-inbox-loading {
            padding: 32px 16px;
            color: #72766b;
            text-align: center;
        }

        @media (max-width: 600px) {
            .vintora-inbox {
                padding: 30px 14px 44px;
            }

            .vintora-inbox-header {
                align-items: flex-start;
                flex-direction: column;
                gap: 14px;
            }

            .vintora-enquiry-card {
                padding: 18px;
            }

            .vintora-enquiry-top {
                flex-direction: column;
                gap: 10px;
            }

            .vintora-inbox-actions,
            .vintora-reply-actions {
                justify-content: stretch;
            }

            .vintora-inbox-actions .vintora-inbox-btn,
            .vintora-reply-actions .vintora-inbox-btn {
                flex: 1;
            }
        }
    `

    return (
        <main className="vintora-inbox">
            <style>{styles}</style>

            <div className="vintora-inbox-container">
                <header className="vintora-inbox-header">
                    <div>
                        <p className="vintora-inbox-eyebrow">
                            VINTORA SELLER STUDIO
                        </p>

                        <h1>Enquiries Inbox</h1>

                        <p className="vintora-inbox-subtitle">
                            Buyers ke messages aur item enquiries yahan dekho.
                        </p>
                    </div>

                    <span className="vintora-inbox-count">
                        {enquiries.length} enquiries
                    </span>
                </header>

                {notice && (
                    <div className="vintora-inbox-notice" role="status">
                        {notice}
                    </div>
                )}

                {loading ? (
                    <div className="vintora-inbox-loading">
                        Enquiries load ho rahi hain...
                    </div>
                ) : enquiries.length > 0 ? (
                    <div className="vintora-enquiry-list">
                        {enquiries.map((enquiry) => (
                            <article
                                key={enquiry.id}
                                className="vintora-enquiry-card"
                            >
                                <div className="vintora-enquiry-top">
                                    <div>
                                        <p className="vintora-enquiry-label">
                                            Item enquiry
                                        </p>

                                        <h2 className="vintora-enquiry-title">
                                            {enquiry.listingTitle ||
                                                'Untitled listing'}
                                        </h2>
                                    </div>

                                    <span className="vintora-enquiry-status">
                                        {enquiry.status || 'New'}
                                    </span>
                                </div>

                                <p className="vintora-enquiry-message">
                                    {enquiry.message || 'No message provided.'}
                                </p>

                                <div className="vintora-enquiry-meta">
                                    {enquiry.buyerName && (
                                        <span>
                                            From: {enquiry.buyerName}
                                        </span>
                                    )}

                                    {enquiry.createdAt && (
                                        <span>
                                            {new Date(
                                                enquiry.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div className="vintora-inbox-actions">
                                    <button
                                        type="button"
                                        className="vintora-inbox-btn vintora-inbox-btn--primary"
                                        onClick={() => handleReply(enquiry)}
                                    >
                                        Reply <span aria-hidden="true">→</span>
                                    </button>
                                </div>

                                {replyingTo === enquiry.id && (
                                    <form
                                        className="vintora-reply-form"
                                        onSubmit={submitReply}
                                    >
                                        <label
                                            htmlFor={`reply-${enquiry.id}`}
                                        >
                                            Your reply
                                        </label>

                                        <textarea
                                            id={`reply-${enquiry.id}`}
                                            className="vintora-inbox-textarea"
                                            value={replyMessage}
                                            onChange={(e) =>
                                                setReplyMessage(e.target.value)
                                            }
                                            placeholder="Apna reply likho..."
                                            required
                                        />

                                        <div className="vintora-reply-actions">
                                            <button
                                                type="button"
                                                className="vintora-inbox-btn vintora-inbox-btn--outline"
                                                onClick={() => {
                                                    setReplyingTo(null)
                                                    setReplyMessage('')
                                                    setNotice('')
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="vintora-inbox-btn vintora-inbox-btn--primary"
                                            >
                                                Send reply
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <section className="vintora-inbox-empty">
                        <div
                            className="vintora-inbox-empty-icon"
                            aria-hidden="true"
                        >
                            ✉
                        </div>

                        <h2>No enquiries yet</h2>

                        <p>
                            Jab buyers tumhari listings ke baare mein message
                            bhejenge, unki enquiries yahan dikhengi.
                        </p>
                    </section>
                )}
            </div>
        </main>
    )
}

export default EnquiriesInbox
