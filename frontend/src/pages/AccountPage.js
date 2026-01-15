import { NavLink, Outlet } from "react-router-dom";

export default function AccountPage() {
    return (
        <main className="container">
            <nav style={{ display: "flex", gap: 8 }}>
                <NavLink to="favorites">Favorites</NavLink>
                <NavLink to="submissions">My Submissions</NavLink>
            </nav>

            <div style={{ marginTop: 16 }}>
                <Outlet />
            </div>
        </main>
    );
}
