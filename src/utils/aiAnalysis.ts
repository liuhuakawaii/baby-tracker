import { Platform } from 'react-native';
import { AIConfig, Baby, Record } from '../constants/types';
import {
  buildDailySummary,
  formatTime,
  getAgeLabel,
  getTodayRecords,
  toDateKey,
} from './records';

interface AIAnalysisRequest {
  aiConfig: AIConfig;
  baby: Baby;
  records: Record[];
  customRequest: string;
  onToken: (content: string) => void;
}

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

interface ChatCompletionChoice {
  delta?: {
    content?: string;
  };
  message?: {
    content?: string;
  };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
  error?: {
    message?: string;
  };
}

export const AI_ANALYSIS_SYSTEM_PROMPT = [
  '你是一位温和、专业、谨慎的婴儿喂养与日常护理分析助手。',
  '你只基于家长在 app 中已经记录的数据做观察，不把“未记录”推断成“没有发生”。',
  '如果记录很少、记录间隔异常、或当前时间还没覆盖完整一天，要明确说明样本有限，并提醒可能存在漏记。',
  '请用“目前记录到”“截至当前时间”“从已记录数据看”这类表述，避免说“今天只喂了几次”这种绝对判断。',
  '不要制造恐慌，不要替代医生诊断；如出现持续拒奶、明显精神差、尿量显著减少、发热、喷射性呕吐、血便等情况，建议及时联系医生。',
  '输出要短、具体、可执行。不要使用 Markdown 标题符号，例如 ###；不要使用表格；可以用简短标题和要点。',
].join('\n');

function formatLocalDateTime(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function getDayProgressDescription(date: Date) {
  const hour = date.getHours();

  if (hour < 6) {
    return '当前仍是凌晨，今天的记录窗口非常短，不能按全天数据判断。';
  }

  if (hour < 12) {
    return '当前仍是上午，今天还没有结束，不能按全天数据判断。';
  }

  if (hour < 18) {
    return '当前是下午，今天还有后续护理记录可能继续增加。';
  }

  return '当前已接近或进入晚上，可以结合白天记录做阶段性观察，但仍要留意是否存在漏记。';
}

function getLatestRecordLabel(records: Record[]) {
  if (!records.length) {
    return '今天还没有记录到任何喂养或换尿裤信息';
  }

  const latestRecord = [...records].sort(
    (first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
  )[0];

  return `${formatTime(latestRecord.created_at)} 有一条${latestRecord.type === 'feeding' ? '喂养' : '换尿裤'}记录`;
}

function formatFeedingRecord(record: Record) {
  if (record.feeding_type === 'direct') {
    const side =
      record.breast_side === 'left' ? '左侧' : record.breast_side === 'right' ? '右侧' : '双侧';

    return `${formatTime(record.created_at)} 亲喂，${side}，${record.duration_min ?? 0} 分钟${
      record.note ? `，备注：${record.note}` : ''
    }`;
  }

  const feedingLabel = record.feeding_type === 'bottle_breast' ? '瓶喂母乳' : '瓶喂奶粉';

  return `${formatTime(record.created_at)} ${feedingLabel}，${record.amount_ml ?? 0} ml${
    record.note ? `，备注：${record.note}` : ''
  }`;
}

function formatDiaperRecord(record: Record) {
  const diaperLabel =
    record.diaper_type === 'wet' ? '尿布湿' : record.diaper_type === 'dirty' ? '大便' : '尿便混合';

  return `${formatTime(record.created_at)} ${diaperLabel}${record.note ? `，备注：${record.note}` : ''}`;
}

function listOrFallback(values: string[], fallback: string) {
  return values.length ? values.map((value) => `- ${value}`).join('\n') : fallback;
}

export function buildAIAnalysisPrompt(baby: Baby, records: Record[], customRequest: string) {
  const now = new Date();
  const todayRecords = getTodayRecords(records);
  const todaySummary = buildDailySummary(todayRecords);
  const todayKey = toDateKey(now);
  const bottleMilkRecords = todayRecords.filter(
    (record) => record.type === 'feeding' && record.feeding_type !== 'direct'
  );
  const directFeedRecords = todayRecords.filter(
    (record) => record.type === 'feeding' && record.feeding_type === 'direct'
  );
  const diaperRecords = todayRecords.filter((record) => record.type === 'diaper');

  const todayTimeline = [...todayRecords]
    .sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime())
    .map((record) => (record.type === 'feeding' ? formatFeedingRecord(record) : formatDiaperRecord(record)));

  const customRequestSection = customRequest.trim()
    ? `\n\n家长本次额外关注：\n${customRequest.trim()}\n请优先回应这个关注点，但不要牺牲上面的谨慎边界。`
    : '';

  return `请根据下面这些 app 记录，做一次“截至当前时间”的婴儿护理分析。

关键边界：
- 这些数据只代表家长已经在 app 中记录的内容，不等于宝宝今天实际发生的全部护理行为。
- 今天还没有结束，请结合当前时间判断，不要把当前记录当成完整全天数据。
- 如果记录很少，请明确说“样本还不够多，只能做初步观察”，并提醒可能存在漏记。
- 如果今天只记录到 1 次喂养，请说“目前只记录到 1 次喂养”，不要说“今天只喂了 1 次”。
- 建议要落到家长接下来能做的动作，例如补记、继续观察、下一次喂养关注点。

分析时间：
- 当前本地时间：${formatLocalDateTime(now)}
- 分析日期：${todayKey}
- 今日进度：${getDayProgressDescription(now)}
- 最近记录：${getLatestRecordLabel(todayRecords)}

宝宝信息：
- 昵称：${baby.name}
- 性别：${baby.gender === 'male' ? '男宝宝' : '女宝宝'}
- 生日：${baby.birthday}
- 年龄：${getAgeLabel(baby.birthday)}
- 身高：${baby.height} cm
- 体重：${baby.weight} kg

截至当前时间的今日摘要：
- 已记录喂养次数：${todaySummary.feedings}
- 已记录瓶喂次数：${todaySummary.bottleFeedings}
- 已记录瓶喂总量：${todaySummary.totalBottleMl} ml
- 已记录亲喂次数：${todaySummary.breastFeedings}
- 已记录亲喂总时长：${todaySummary.nursingMinutes} 分钟
- 已记录换尿裤次数：${todaySummary.diapers}
- 已记录尿布湿：${todaySummary.wetDiapers} 次
- 已记录大便：${todaySummary.dirtyDiapers} 次
- 已记录混合便：${todaySummary.mixedDiapers} 次

今日瓶喂记录：
${listOrFallback(bottleMilkRecords.map(formatFeedingRecord), '今天暂未记录瓶喂。')}

今日亲喂记录：
${listOrFallback(directFeedRecords.map(formatFeedingRecord), '今天暂未记录亲喂。')}

今日排尿排便记录：
${listOrFallback(diaperRecords.map(formatDiaperRecord), '今天暂未记录换尿裤。')}

今日完整时间线：
${listOrFallback(todayTimeline, '今天还没有任何记录。')}

请按下面 4 个部分输出，每部分 2 到 4 条即可：
1. 喂养情况
2. 排尿排便情况
3. 接下来怎么做
4. 需要留意

输出要求：
- 只用中文。
- 不要输出 ###、***、表格或复杂 Markdown。
- 允许使用短标题和列表。
- 不要把“暂未记录”写成“没有发生”。
- 内容要具体，避免泛泛而谈。${customRequestSection}`;
}

function buildMessages(baby: Baby, records: Record[], customRequest: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: AI_ANALYSIS_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: buildAIAnalysisPrompt(baby, records, customRequest),
    },
  ];
}

function getCompletionEndpoint(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}

async function readErrorMessage(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return `请求失败：${response.status}`;
  }

  try {
    const json = JSON.parse(responseText) as ChatCompletionResponse;
    return json.error?.message ? `请求失败：${response.status} ${json.error.message}` : `请求失败：${response.status} ${responseText}`;
  } catch {
    return `请求失败：${response.status} ${responseText}`;
  }
}

function extractStreamContent(payload: string) {
  const json = JSON.parse(payload) as ChatCompletionResponse;
  return json.choices?.[0]?.delta?.content ?? '';
}

async function readStreamingCompletion(response: Response, onToken: (content: string) => void) {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('当前运行环境无法读取流式响应，请改用非流式请求。');
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith('data: ')) {
        continue;
      }

      const payload = trimmed.slice(6);

      if (payload === '[DONE]') {
        continue;
      }

      try {
        const content = extractStreamContent(payload);

        if (content) {
          fullText += content;
          onToken(content);
        }
      } catch {
        continue;
      }
    }
  }

  if (!fullText.trim()) {
    throw new Error('AI 没有返回可用内容，请稍后重试。');
  }

  return fullText;
}

async function readJsonCompletion(response: Response, onToken: (content: string) => void) {
  const json = (await response.json()) as ChatCompletionResponse;
  const content = json.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error(json.error?.message ?? 'AI 没有返回可用内容，请稍后重试。');
  }

  onToken(content);
  return content;
}

export async function requestAIAnalysis({
  aiConfig,
  baby,
  records,
  customRequest,
  onToken,
}: AIAnalysisRequest) {
  const useStreaming = Platform.OS === 'web';
  const response = await fetch(getCompletionEndpoint(aiConfig.base_url), {
    method: 'POST',
    headers: {
      Accept: useStreaming ? 'text/event-stream' : 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.api_key}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: buildMessages(baby, records, customRequest),
      stream: useStreaming,
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (useStreaming) {
    return readStreamingCompletion(response, onToken);
  }

  return readJsonCompletion(response, onToken);
}
