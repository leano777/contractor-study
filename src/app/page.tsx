import Link from 'next/link';
import { BookOpen, Brain, Trophy, MessageCircle, Smartphone, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Ace Your Contractor License Exam
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Daily practice questions, AI-powered study assistance, and comprehensive 
              prep for California License A & B exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3"
              >
                Get Started Free
              </Link>
              <Link
                href="/admin/qr"
                className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3"
              >
                View QR Code
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Pass
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Daily Challenges"
            description="Duolingo-style daily questions to build consistent study habits and track your streak."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI Study Assistant"
            description="Ask any question about code compliance, building standards, or exam topics."
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Course Materials"
            description="All your class handouts transformed into searchable, interactive study content."
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Gamification"
            description="Earn streaks, badges, and compete on leaderboards with your classmates."
          />
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Multi-Channel"
            description="Get notifications via email, SMS, or push notifications - your choice."
          />
          <FeatureCard
            icon={<Smartphone className="w-8 h-8" />}
            title="Mobile App"
            description="Study on the go with our iOS and Android apps."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Studying?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join your classmates and start preparing for your contractor license exam today.
          </p>
          <Link
            href="/register"
            className="btn-primary text-lg px-8 py-3"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2026 Contractor License Study System. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6">
      <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
