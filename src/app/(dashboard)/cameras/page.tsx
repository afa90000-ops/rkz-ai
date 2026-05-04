'use client'
import { mockCameras } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { getCameraStatusLabel } from '@/lib/utils'
import { Camera, Wifi, WifiOff, Settings, Play, AlertCircle } from 'lucide-react'

const cameraTypeLabels: Record<string, string> = { fixed: 'ثابتة', ptz: 'PTZ متحركة', thermal: 'حرارية', drone: 'درون' }

export default function CamerasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الكاميرات</h1>
          <p className="text-slate-400 text-sm mt-0.5">إدارة ومراقبة كاميرات المواقع</p>
        </div>
        <button className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Camera size={16} /> إضافة كاميرا
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الكاميرات', value: mockCameras.length, color: 'text-white' },
          { label: 'متصلة', value: mockCameras.filter(c => c.status === 'online').length, color: 'text-emerald-400' },
          { label: 'غير متصلة', value: mockCameras.filter(c => c.status === 'offline').length, color: 'text-red-400' },
          { label: 'الذكاء الاصطناعي مفعل', value: mockCameras.filter(c => c.ai_enabled).length, color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        {[...mockCameras, ...mockCameras].slice(0, 8).map((camera, i) => (
          <div key={`${camera.id}-${i}`} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors group">
            {/* Video preview placeholder */}
            <div className="relative bg-slate-800 aspect-video flex items-center justify-center">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '20px 20px'}} />
              {camera.status === 'online' ? (
                <>
                  <div className="text-center">
                    <Camera size={36} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">بث مباشر</p>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/90 rounded-full px-2 py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[10px] font-semibold">LIVE</span>
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                      <Play size={24} className="text-white" />
                    </div>
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <WifiOff size={36} className="text-red-500/50 mx-auto mb-2" />
                  <p className="text-red-400/70 text-xs">غير متصلة</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{camera.name_ar || camera.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cameraTypeLabels[camera.camera_type]}</p>
                </div>
                <Badge variant={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'destructive' : 'warning'}>
                  {getCameraStatusLabel(camera.status)}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-slate-300 font-medium">{camera.resolution}</div>
                  <div className="text-slate-500">الدقة</div>
                </div>
                <div className="bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                  <div className="text-slate-300 font-medium">{camera.fps} FPS</div>
                  <div className="text-slate-500">السرعة</div>
                </div>
                <div className="bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                  <div className={`font-medium ${camera.ai_enabled ? 'text-cyan-400' : 'text-slate-400'}`}>{camera.ai_enabled ? 'مفعل' : 'موقف'}</div>
                  <div className="text-slate-500">الذكاء</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Settings size={12} /> إعدادات
                </button>
                <button className="flex-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Play size={12} /> مشاهدة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
