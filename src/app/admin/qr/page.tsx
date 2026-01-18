'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, ExternalLink, Printer } from 'lucide-react';
import Link from 'next/link';

// ===========================================
// PHASE 1: QUICK WIN - QR Code Generator
// ===========================================
// Generate a QR code that links to your registration form.
// Print it out or display it in your classroom.

export default function QRCodePage() {
  const [baseUrl, setBaseUrl] = useState(
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://your-domain.vercel.app'
  );
  const [utmSource, setUtmSource] = useState('classroom');
  const [utmMedium, setUtmMedium] = useState('qr_code');
  const [utmCampaign, setUtmCampaign] = useState('spring2026');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Build URL with UTM params
  const buildUrl = () => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    const queryString = params.toString();
    return `${baseUrl}/register${queryString ? '?' + queryString : ''}`;
  };

  const registrationUrl = buildUrl();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `contractor-study-qr-${utmCampaign}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contractor License Study - QR Code</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            h1 {
              font-size: 28px;
              margin-bottom: 8px;
              color: #1e40af;
            }
            p {
              color: #4b5563;
              margin-bottom: 24px;
            }
            .qr-container {
              background: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              display: inline-block;
              margin-bottom: 24px;
            }
            .instructions {
              background: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              text-align: left;
            }
            .instructions h3 {
              font-size: 14px;
              margin: 0 0 8px 0;
              color: #374151;
            }
            .instructions ol {
              margin: 0;
              padding-left: 20px;
              color: #6b7280;
              font-size: 14px;
            }
            .instructions li {
              margin-bottom: 4px;
            }
            @media print {
              body { padding: 0; }
              .qr-container { box-shadow: none; border: 2px solid #e5e7eb; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📚 Join the Study Group</h1>
            <p>Scan to register for Contractor License exam prep</p>
            <div class="qr-container">
              ${svgData}
            </div>
            <div class="instructions">
              <h3>How to join:</h3>
              <ol>
                <li>Open your phone's camera</li>
                <li>Point it at the QR code</li>
                <li>Tap the link that appears</li>
                <li>Fill out the registration form</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">QR Code Generator</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create trackable QR codes for your registration form. Perfect for classroom posters, flyers, and printed materials.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">QR Code Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure your tracking parameters</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="baseUrl" className="label block mb-2">
                  Your App URL
                </label>
                <input
                  type="url"
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="input transition-shadow hover:shadow-sm"
                  placeholder="https://your-domain.vercel.app"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>After deploying to Vercel, update this with your actual URL</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="utmSource" className="label block mb-2">
                    UTM Source
                  </label>
                  <select
                    id="utmSource"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="input transition-shadow hover:shadow-sm"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="flyer">Flyer</option>
                    <option value="poster">Poster</option>
                    <option value="handout">Handout</option>
                    <option value="email">Email</option>
                    <option value="social">Social Media</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Where displayed</p>
                </div>

                <div>
                  <label htmlFor="utmMedium" className="label block mb-2">
                    UTM Medium
                  </label>
                  <select
                    id="utmMedium"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="input transition-shadow hover:shadow-sm"
                  >
                    <option value="qr_code">QR Code</option>
                    <option value="print">Print</option>
                    <option value="digital">Digital</option>
                    <option value="referral">Referral</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Medium type</p>
                </div>
              </div>

              <div>
                <label htmlFor="utmCampaign" className="label block mb-2">
                  UTM Campaign
                </label>
                <input
                  type="text"
                  id="utmCampaign"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="input transition-shadow hover:shadow-sm"
                  placeholder="spring2026"
                />
                <p className="text-xs text-gray-500 mt-2">Cohort or campaign name</p>
              </div>

              <div className="pt-2">
                <label className="label block mb-2">Generated Registration URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={registrationUrl}
                      readOnly
                      className="input pr-10 text-xs bg-gray-50 font-mono text-gray-600"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="btn-outline px-3 transition-all hover:border-primary-300 hover:bg-primary-50"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    href={registrationUrl}
                    target="_blank"
                    className="btn-outline px-3 transition-all hover:border-primary-300 hover:bg-primary-50"
                    title="Open URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-2">This URL will be encoded in your QR code</p>
              </div>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="card overflow-hidden lg:sticky lg:top-6 h-fit">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900">QR Code Preview</h2>
              <p className="text-sm text-gray-500 mt-1">Scan to test your registration link</p>
            </div>

            <div className="p-6">
              <div
                ref={qrRef}
                className="relative bg-gradient-to-br from-white to-gray-50 border-2 border-primary-100 rounded-2xl p-8 flex items-center justify-center mb-6 shadow-inner group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl"></div>
                <div className="relative transition-transform group-hover:scale-105 duration-300">
                  <QRCodeSVG
                    value={registrationUrl}
                    size={256}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: '/icon.png',
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={downloadQRCode} className="btn-primary flex-1 shadow-sm hover:shadow transition-shadow">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button onClick={printQRCode} className="btn-secondary flex-1 shadow-sm hover:shadow transition-shadow">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card overflow-hidden mt-8">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary-50/50 to-white border-b border-primary-100">
            <h2 className="text-lg font-semibold text-gray-900">How to Use Your QR Code</h2>
            <p className="text-sm text-gray-500 mt-1">Follow these steps to get started</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group">
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-lg shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                  1
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Deploy Your App</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Push to GitHub and connect to Vercel. Update the URL above with your deployed domain.
                </p>
              </div>
              <div className="group">
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-lg shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                  2
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Print or Display</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Download the QR code or print the poster. Display it in your classroom or on flyers.
                </p>
              </div>
              <div className="group">
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center mb-4 font-bold text-lg shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                  3
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Students Scan</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Students scan with their phone camera and fill out the registration form.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
