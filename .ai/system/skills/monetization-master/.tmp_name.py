import re
path = '.ai/system/skills/monetization-master/SKILL.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_desc = (
    '搞钱搭子 — 像懂行朋友一样陪你聊清楚做什么、值不值、怎么试、怎么干，'
    '把你的兴趣、技能、预算翻译成 3 个能落地的赚钱方向，再一路陪到上线赚到第一笔钱。'
    '当用户提到副业、赚钱、找方向、行业前景、商业模式、项目验证、落地方案、'
    '想做某件事赚钱、不知道做什么、转型、变现等任何与赚钱 / 创业 / 副业相关的话题时，'
    '必须使用本技能；即使没明说要赚钱，只要话题涉及个人变现、赛道分析、'
    '项目可行性或执行计划，也优先用本技能而不是泛泛回答。'
    '本技能内置合规预检、资产分级、UE 测算、长周期赛道支持，'
    '能避免推荐违法 / 超预算 / 赛道不适配的方案。'
)

content = re.sub(
    r'description:.*?(\n---)',
    'description: ' + new_desc + r'\1',
    content,
    count=1,
    flags=re.DOTALL,
)

content = content.replace('# 赚钱大师一站式咨询技能', '# 搞钱搭子（Monetization Master）')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
