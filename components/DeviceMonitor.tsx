
import React, { useState, useEffect } from 'react';
import { DeviceInfo } from '../types';
import { getVisitorLogs } from '../store';

const DeviceMonitor: React.FC = () => {
  const [logs, setLogs] = useState<DeviceInfo[]>([]);

  useEffect(() => {
    setLogs(getVisitorLogs());
  }, []);

  const currentDevice = logs[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn pb-24">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Surveillance</h2>
          <p className="text-gray-400 font-medium">Real-time device tracking, global mapping, and IP logging.</p>
        </div>
        <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Latest Traffic Snapshot */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📡</div>
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-6 tracking-widest">Live Entry</h3>
            {currentDevice ? (
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Device Identity</div>
                  <div className="text-xl font-black text-amber-500">{currentDevice.deviceType || 'Unknown'}</div>
                  <div className="text-[10px] text-gray-400 font-medium">{currentDevice.platform} • {currentDevice.cores} Cores</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Public IP Address</div>
                  <div className="text-xl font-mono text-green-400 font-bold">{currentDevice.ip}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Origin Country</div>
                  <div className="text-xl font-black text-white">{currentDevice.country || 'Global Trace'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Geographic Coordinates</div>
                  {currentDevice.latitude && currentDevice.longitude ? (
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-mono">{currentDevice.latitude.toFixed(6)}, {currentDevice.longitude.toFixed(6)}</div>
                      <a 
                        href={`https://www.google.com/maps?q=${currentDevice.latitude},${currentDevice.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-400 font-black uppercase hover:underline flex items-center gap-1"
                      >
                        View on Map 📍
                      </a>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 italic">Location Denied</div>
                  )}
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-[10px] text-gray-500 font-black uppercase">Energy</span>
                  <span className="text-sm font-bold text-indigo-400">{currentDevice.batteryLevel || 'External Power'}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 italic py-10">Searching for connections...</div>
            )}
          </div>
        </div>

        {/* Deep Traffic Logs */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight">Entry Archive</h3>
              <span className="bg-black text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                {logs.length} Total Logs
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity & IP</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Country</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-900 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{new Date(log.timestamp).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">{log.deviceType}</span>
                          <span className="font-mono text-sm font-bold text-gray-800">{log.ip}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-gray-900">{log.country}</span>
                      </td>
                      <td className="px-8 py-6">
                        {log.latitude ? (
                          <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-mono text-gray-500">{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</div>
                            <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Map Link</a>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase">Not Avail</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <div className="p-20 text-center">
                   <div className="text-4xl mb-4">📡</div>
                   <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Waiting for inbound data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceMonitor;
