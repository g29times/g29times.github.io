import React, { useState } from 'react';
import { Clipboard, Send, ChevronRight, CheckCircle2, Info, BookOpen, Users, Bike } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [formData, setFormData] = useState({
    learningGoal: '',
    timeBudget: '',
    communityValue: '',
    govAccess: '',
    appMoat: '',
    offlineLink: ''
  });

  const sections = [
    {
      id: 'learning',
      title: '1. 个人 AI 学习路径',
      icon: <BookOpen className="w-5 h-5" />,
      questions: [
        {
          id: 'learningGoal',
          label: '你的预期目标是什么？',
          type: 'select',
          options: [
            '仅了解术语，能跟政府客户聊天（方案商）',
            '能熟练使用 Prompt 和工作流工具（超级用户）',
            '掌握 Vibe coding，能独立开发原型（独立开发者）',
            '从底层算法学起（硬核工程师）'
          ],
          hint: 'Neo 提示：商科背景建议选前两个，ROI 最高。'
        },
        {
          id: 'timeBudget',
          label: '每周能投入多少时间学习？',
          type: 'select',
          options: ['3 小时以内 (碎片化)', '3-10 小时 (有系统感)', '10 小时以上 (深度进阶)'],
        }
      ]
    },
    {
      id: 'community',
      title: '2. 政务 AI 社区规划',
      icon: <Users className="w-5 h-5" />,
      questions: [
        {
          id: 'communityValue',
          label: '你认为公务员加入社区的首要痛点是？',
          type: 'text',
          placeholder: '例如：写公文提效、政策比对、合规性审查...',
          hint: 'Neo 提示：G 端社区“有用”比“有趣”更重要。'
        },
        {
          id: 'govAccess',
          label: '目前的资源支持情况？',
          type: 'select',
          options: [
            '纯民间社群（需冷启动）',
            '有部门背书（作为官方试点）',
            '已打通内网通道（具有技术壁垒）'
          ]
        }
      ]
    },
    {
      id: 'app',
      title: '3. 二手电摩回收平台',
      icon: <Bike className="w-5 h-5" />,
      questions: [
        {
          id: 'appMoat',
          label: '在“回收”这个环节，AI 扮演什么角色？',
          type: 'text',
          placeholder: '例如：视觉识别车况估价、电池残值预测、撮合定价...',
          hint: 'Neo 提示：Vibe coding 能写界面，但算不准电池寿命。'
        },
        {
          id: 'offlineLink',
          label: '线下履约能力如何？',
          type: 'select',
          options: [
            '纯线上平台（依赖第三方检测）',
            '有合作维修店/回收点（O2O 模式）',
            '结合政府报废补贴政策（政务流量）'
          ]
        }
      ]
    }
  ];

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(formData, null, 2);
    // Use fallback for clipboard in iframes
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('回答已复制到剪贴板，请发送给 Neo 吧！');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
             Neo 的 AI 项目梳理问卷
          </h1>
          <p className="text-slate-400 text-sm">
            Hi! 为了帮你把想法落地，我们需要从技术视角和商业视角做一次深度解耦。
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {['intro', ...sections.map(s => s.id), 'summary'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'intro' ? '开始' : tab === 'summary' ? '提交' : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'intro' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">准备好了吗？</h2>
              <div className="text-slate-600 leading-relaxed space-y-2">
                <p>商科与技术的碰撞往往能产生巨大的火花。这套问卷旨在帮你理清：</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>你的时间该花在算法上还是工具上？</li>
                  <li>政府社区的壁垒是技术还是合规？</li>
                  <li>二手电摩平台的核心是代码还是电池标准？</li>
                </ul>
              </div>
              <button 
                onClick={() => setActiveTab('learning')}
                className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
              >
                开始填写 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {sections.map((section) => activeTab === section.id && (
            <div key={section.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                {section.icon} <span>{section.title}</span>
              </div>
              
              {section.questions.map((q) => (
                <div key={q.id} className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">{q.label}</label>
                  
                  {q.type === 'select' ? (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleInputChange(q.id, opt)}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            formData[q.id] === opt 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100' 
                            : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData[q.id] === opt ? 'border-blue-500' : 'border-slate-300'}`}>
                              {formData[q.id] === opt && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            </div>
                            {opt}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      placeholder={q.placeholder}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none h-24 text-sm"
                      value={formData[q.id]}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                    />
                  )}
                  
                  {q.hint && (
                    <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                      <Info className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{q.hint}</span>
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === section.id);
                  if (idx < sections.length - 1) setActiveTab(sections[idx+1].id);
                  else setActiveTab('summary');
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition-all"
              >
                下一步
              </button>
            </div>
          ))}

          {activeTab === 'summary' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold">感谢你的认真思考！</h2>
              <p className="text-slate-500 text-sm px-4">
                这些信息将帮助 Neo 从 15 年的技术经验中，为你提取出最适合的转型路线和产品架构建议。
              </p>
              
              <div className="bg-slate-50 p-4 rounded-xl text-left text-xs font-mono text-slate-600 max-h-40 overflow-y-auto border border-slate-100">
                {JSON.stringify(formData, null, 2)}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveTab('intro')}
                  className="flex-1 py-4 px-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  返回修改
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <Clipboard className="w-4 h-4" /> 复制结果发送
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-400 text-xs">
        Generated for Neo | Built with Vibe coding & Technical Decoupling
      </div>
    </div>
  );
};

export default App;