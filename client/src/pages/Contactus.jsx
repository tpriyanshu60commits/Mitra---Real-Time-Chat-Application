import React from "react";

const Contactus = () => {
  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-base-200 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Panel */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <span className="text-5xl">📬</span>
              <h1 className="text-4xl font-extrabold mt-4 text-base-content">
                Get in Touch
              </h1>
              <p className="text-base-content/50 mt-2 text-lg">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "📧", label: "Email", value: "support@mitra.chat" },
                { icon: "📞", label: "Phone", value: "+91 98765 43210" },
                { icon: "📍", label: "Location", value: "Bengaluru, India" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-base-content/40 uppercase">
                      {label}
                    </p>
                    <p className="text-base-content font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body gap-4">
              <h2 className="text-xl font-bold text-base-content">
                Send a Message
              </h2>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-base-content/70">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-base-content/70">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-base-content/70">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-base-content/70">
                  Message
                </label>
                <textarea
                  className="textarea textarea-bordered w-full resize-none"
                  rows={4}
                  placeholder="Tell us more..."
                />
              </div>

              <button className="btn btn-primary w-full mt-2">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contactus;
