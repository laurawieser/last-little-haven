import EventsList from "./EventsList";

function HomePage() {
  return (
    <main className="container-home">
      {/* Hero */}
      <section className="hero-home">
        <img src="../llh_logo.jpg" alt="Last Little Haven Logo" className="logo-home" />
        <h1>Last Little Haven</h1>
        <p>
          A sapphic art bar and digital archive in Vienna, reimagining a (fictional) lesbian/queer bar from the 1930s-1950s and turning memory into a place you can enter.
        </p>
        <p>
          Part spatial installation, part archive exhibition, part community project - Last Little Haven
          invites you to explore, remember and add to a living collection.
        </p>

        {/* How it works */}
        <div className="howitworks-home" aria-label="How it works">
          <a href="/archive" className="card-link howitworks-link">
            <div className="card howitworks-item">
              <h3>1. Explore</h3>
              <p>Browse archive entries and follow traces across time, places, and artifacts.</p>
              <div className="howitworks-cta">
                <span className="btn btn-primary"></span>
              </div>
            </div>
          </a>

          <a href="/map" className="card-link howitworks-link">
            <div className="card howitworks-item">
              <h3>2. Connect</h3>
              <p>Use the map view to discover how stories, venues, and neighborhoods relate.</p>
              <div className="howitworks-cta">
                <span className="btn btn-secondary"></span>
              </div>
            </div>
          </a>

          <a href="/submit" className="card-link howitworks-link">
            <div className="card howitworks-item">
              <h3>3. Contribute</h3>
              <p>Share photos, memories, or materials to help grow the archive.</p>
              <div className="howitworks-cta">
                <span className="btn btn-secondary"></span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* About */}
      <section className="about-home">
        <div className="about-text-col">
          <h2>About Last Little Haven</h2>

          <p>
            Last Little Haven is a spatial installation that reconstructs and critically re-reads—the idea of a (fictional) lesbian/queer bar from the 1930s to the 1950s.
            It is both an exhibition space and an art bar: a place to meet, to look closely, and to feel how queer history often survives in fragments.
          </p>

          <p>
            In Vienna, this bar becomes a participatory, collaborative environment where the archive is not kept behind glass but activated through presence, conversation and shared attention.
            Alongside the physical space at Gumpendorferstraße 68, the project expands online as a digital archive open to new contributions.
          </p>

          <p>
            The focus is not only on “what happened,” but on how people found each other: hidden meeting points, coded language, gestures of care and moments of risk that shaped sapphic and lesbian nightlife.
            The archive makes gaps visible on purpose because absence is part of the record and remembering can be an active practice not a finished story.
          </p>
        </div>

        <div className="about-highlight">
          <p>
            The project follows a simple principle: reactivate, reclaim, resist - bringing overlooked histories back into the present and giving them room to grow.
          </p>
        </div>
      </section>

      {/* Events */}
      <section className="events-home">
        <h2>Upcoming Events</h2>
        <EventsList />
      </section>

      {/* Contact */}
      <section className="contact-home">
        <h2>Contact</h2>
        <div className="contact-row">
          <div className="contact-col">
            <h3>Address</h3>
            <p>Gumpendorfer Straße 68<br />1060 Vienna</p>
          </div>
          <div className="contact-col">
            <h3>Email</h3>
            <p><a href="mailto:lastlittlehaven@posteo.com">lastlittlehaven@posteo.com</a></p>
          </div>
          <div className="contact-col">
            <h3>Social</h3>
            <p>
              <a href="https://www.instagram.com/last_little_haven/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              {" | "}
              <a href="https://shift.wien/projekte/last-little-haven/" target="_blank" rel="noopener noreferrer">
                SHIFT Wien
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
