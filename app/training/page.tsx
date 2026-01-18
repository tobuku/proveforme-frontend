"use client";

import Link from "next/link";
import { AuthedHeader } from "../../components/AuthedHeader";

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AuthedHeader role={null} />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          BG Training Guide
        </h1>
        <p className="text-slate-600 mb-8">
          Learn how to take high-quality photos and videos for property documentation.
        </p>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Why Quality Matters
            </h2>
            <p className="text-slate-600">
              As a Boots on the Ground (BG), your photos and videos are the investor's eyes on
              their property. High-quality documentation helps investors make informed decisions
              and builds trust in your work. Taking the time to capture clear, well-focused
              images will set you apart as a reliable professional.
            </p>
          </section>

          {/* iPhone Tips */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📱</span> iPhone Camera Tips
            </h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Disable Live Photos</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Live Photos create larger files and can cause issues with uploads. To disable:
                </p>
                <ol className="list-decimal pl-5 text-slate-600 text-sm space-y-1">
                  <li>Open the Camera app</li>
                  <li>Look for the Live Photo icon (concentric circles) at the top</li>
                  <li>Tap it until you see a slash through it (Live Off)</li>
                  <li>To keep it off permanently: Settings → Camera → Preserve Settings → Live Photo → On</li>
                </ol>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Focus and Exposure</h3>
                <p className="text-slate-600 text-sm mb-2">
                  The yellow square on your iPhone camera shows where it's focusing:
                </p>
                <ol className="list-decimal pl-5 text-slate-600 text-sm space-y-1">
                  <li>Tap on the screen where you want to focus (a yellow square appears)</li>
                  <li>The camera adjusts focus and exposure for that area</li>
                  <li>Slide your finger up/down near the yellow square to adjust brightness</li>
                </ol>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Lock AE/AF (Auto Exposure/Auto Focus)</h3>
                <p className="text-slate-600 text-sm mb-2">
                  For consistent shots, lock the focus and exposure:
                </p>
                <ol className="list-decimal pl-5 text-slate-600 text-sm space-y-1">
                  <li>Tap and HOLD on the area you want to focus on</li>
                  <li>Hold for 2-3 seconds until you see "AE/AF LOCK" at the top</li>
                  <li>The focus and exposure are now locked - you can move the phone without them changing</li>
                  <li>Tap anywhere on screen to unlock</li>
                </ol>
                <p className="text-slate-500 text-xs mt-2 italic">
                  Tip: Use AE/AF Lock when photographing rooms with windows to prevent the camera from
                  constantly adjusting exposure.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Grid Lines</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Enable grid lines for better composition:
                </p>
                <ol className="list-decimal pl-5 text-slate-600 text-sm space-y-1">
                  <li>Go to Settings → Camera</li>
                  <li>Turn on "Grid"</li>
                  <li>Use the grid to keep horizons level and walls straight</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Android Tips */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📱</span> Android Camera Tips
            </h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Focus and Exposure</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Most Android cameras work similarly to iPhone:
                </p>
                <ol className="list-decimal pl-5 text-slate-600 text-sm space-y-1">
                  <li>Tap on the screen where you want to focus</li>
                  <li>A focus indicator (circle or square) will appear</li>
                  <li>Look for a brightness slider that appears - slide to adjust exposure</li>
                </ol>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Lock Focus (AE/AF Lock)</h3>
                <p className="text-slate-600 text-sm mb-2">
                  On most Android phones:
                </p>
                <ol className="list-decimal pl-5 text-slate-600 text-sm space-y-1">
                  <li>Tap and hold on the area you want to focus</li>
                  <li>Look for "AF/AE Locked" or a lock icon</li>
                  <li>Some phones require going to camera settings to enable this feature</li>
                </ol>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Pro/Manual Mode</h3>
                <p className="text-slate-600 text-sm">
                  Many Android phones have a Pro or Manual mode in the camera app that gives you
                  more control over focus, exposure, and white balance. Look for it in your
                  camera modes or settings.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span> Best Practices for Property Photos
            </h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="font-semibold text-green-900 mb-2">Do:</h3>
                <ul className="list-disc pl-5 text-green-800 text-sm space-y-1">
                  <li>Clean your camera lens before starting</li>
                  <li>Hold your phone steady with both hands</li>
                  <li>Take photos in landscape (horizontal) orientation for rooms</li>
                  <li>Include context - show how areas connect to each other</li>
                  <li>Photograph all four corners of each room</li>
                  <li>Capture close-ups of any damage, repairs, or items of interest</li>
                  <li>Turn on all lights when photographing interiors</li>
                  <li>Take more photos than you think you need</li>
                </ul>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="font-semibold text-red-900 mb-2">Don't:</h3>
                <ul className="list-disc pl-5 text-red-800 text-sm space-y-1">
                  <li>Take blurry or out-of-focus photos</li>
                  <li>Shoot directly into bright windows (causes dark interiors)</li>
                  <li>Use flash in mirrors or reflective surfaces</li>
                  <li>Include people's faces (privacy concerns)</li>
                  <li>Rush - take your time to get quality shots</li>
                  <li>Forget to photograph the exterior from multiple angles</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Video Tips */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎥</span> Video Recording Tips
            </h2>

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <ul className="list-disc pl-5 text-slate-600 text-sm space-y-2">
                <li>
                  <strong>Hold steady:</strong> Use both hands and keep your elbows close to your body
                </li>
                <li>
                  <strong>Move slowly:</strong> Pan and walk slowly to avoid motion blur and dizziness
                </li>
                <li>
                  <strong>Narrate:</strong> Describe what you're showing as you record
                </li>
                <li>
                  <strong>Horizontal only:</strong> Always record video in landscape orientation
                </li>
                <li>
                  <strong>Keep clips short:</strong> 30-60 second clips are easier to upload and review
                </li>
                <li>
                  <strong>Check audio:</strong> Make sure your finger isn't covering the microphone
                </li>
              </ul>
            </div>
          </section>

          {/* Checklist */}
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Pre-Visit Checklist
            </h2>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start gap-2">
                <span>☐</span> Phone fully charged (or bring a portable charger)
              </li>
              <li className="flex items-start gap-2">
                <span>☐</span> Plenty of storage space on your phone
              </li>
              <li className="flex items-start gap-2">
                <span>☐</span> Camera lens cleaned
              </li>
              <li className="flex items-start gap-2">
                <span>☐</span> Live Photos disabled
              </li>
              <li className="flex items-start gap-2">
                <span>☐</span> Grid lines enabled
              </li>
              <li className="flex items-start gap-2">
                <span>☐</span> Review project requirements and scope of work
              </li>
              <li className="flex items-start gap-2">
                <span>☐</span> Note any specific areas the investor wants documented
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-black"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-[11px] text-slate-500">
          <p>&copy; 2025 ProveForMe.com. All rights reserved. Owned and operated by Know Leap Strategies.</p>
        </div>
      </footer>
    </div>
  );
}
