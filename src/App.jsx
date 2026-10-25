import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Auth from './Auth'
import Home from './Home'

// Buyer pages
import BuyerHomePage from './buyer/HomePage'
import ItemDetails from './buyer/ItemDetailsPage'
import Wishlist from './buyer/Wishlist'
import MyEnquiries from './buyer/MyEnquiries'

// Seller pages
import AddListing from './seller/AddListing'
import MyListings from './seller/MyListings.jsx'
import EnquiriesInbox from './seller/EnquiriesInbox'

// Admin pages
import AdminHomePage from './admin/HomePage'
import PendingListingsPage from './admin/PendingListingsPage'
import ReportedListingsPage from './admin/ReportedListingsPage'
import UsersPage from './admin/UsersPage'
import AuditLogPage from './admin/AuditLogPage'

const App = () => {
    return (
        <>
            <Navbar />

            <main>
                <Routes>
                    {/* Public pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/item/:id" element={<ItemDetails />} />

                    {/* Authentication */}
                    <Route
                        path="/login"
                        element={<Auth mode="login" />}
                    />
                    <Route
                        path="/signup"
                        element={<Auth mode="signup" />}
                    />

                    {/* Buyer routes */}
                    <Route
                        path="/buyer/home"
                        element={
                            <ProtectedRoute role="buyer">
                                <BuyerHomePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute role="buyer">
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-enquiries"
                        element={
                            <ProtectedRoute role="buyer">
                                <MyEnquiries />
                            </ProtectedRoute>
                        }
                    />

                    {/* Seller routes */}
                    <Route
                        path="/seller/add"
                        element={
                            <ProtectedRoute role="seller">
                                <AddListing />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/seller/edit/:id"
                        element={
                            <ProtectedRoute role="seller">
                                <AddListing />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/seller/listings"
                        element={
                            <ProtectedRoute role="seller">
                                <MyListings />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/seller/enquiries"
                        element={
                            <ProtectedRoute role="seller">
                                <EnquiriesInbox />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute role="admin">
                                <AdminHomePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/pending-listings"
                        element={
                            <ProtectedRoute role="admin">
                                <PendingListingsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/reported-listings"
                        element={
                            <ProtectedRoute role="admin">
                                <ReportedListingsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute role="admin">
                                <UsersPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/audit-log"
                        element={
                            <ProtectedRoute role="admin">
                                <AuditLogPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Unknown route */}
                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </main>

            <Footer />
        </>
    )
}

export default App