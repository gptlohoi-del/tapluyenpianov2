#!/usr/bin/env python3
"""Validate and optionally export a simple note timeline from every bundled MXL."""
import json, pathlib, sys, zipfile, xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
SONGS=ROOT/'songs'
PITCH={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}

def xml_for(f):
    if f.suffix.lower()=='.mxl':
        with zipfile.ZipFile(f) as z:
            rootfile=None
            if 'META-INF/container.xml' in z.namelist():
                cx=ET.fromstring(z.read('META-INF/container.xml'))
                rootfile=next((i.attrib['full-path'] for i in cx.iter() if i.tag.endswith('rootfile') and 'full-path' in i.attrib),None)
            if not rootfile:
                rootfile=next((x for x in z.namelist() if x.endswith(('.xml','.musicxml')) and not x.startswith('META-INF/')),None)
            if not rootfile: raise ValueError('Missing MusicXML rootfile')
            return ET.fromstring(z.read(rootfile))
    return ET.parse(f).getroot()

def timeline(file):
    root=xml_for(file)
    parts=root.findall('./part')
    if not parts:raise ValueError('No part elements')
    measures=parts[0].findall('./measure')
    div=1;beats=4;beat_type=4;cursor=0
    right=[];left=[];rests=[];info=[]
    for i,m in enumerate(measures):
        position=0;max_position=0;last_start=0
        attributes=m.find('attributes')
        if attributes is not None:
            try: div=int(attributes.findtext('divisions') or div)
            except ValueError:pass
            try: beats=int(attributes.findtext('time/beats') or beats);beat_type=int(attributes.findtext('time/beat-type') or beat_type)
            except ValueError:pass
        for el in list(m):
            tag=el.tag.split('}')[-1]
            if tag=='backup': position=max(0,position-int(el.findtext('duration') or 0))
            elif tag=='forward': position+=int(el.findtext('duration') or 0);max_position=max(max_position,position)
            elif tag=='note':
                if el.find('grace') is not None:continue
                duration=int(el.findtext('duration') or 0)
                chord=el.find('chord') is not None
                start=last_start if chord else position
                staff=int(el.findtext('staff') or 1)
                n={'startQuarter':round(cursor+start/div,5),'durationQuarter':round(duration/div,5)}
                if el.find('rest') is not None:
                    if staff==1:rests.append(n)
                else:
                    pitch=el.find('pitch')
                    if pitch is not None:
                        midi=12*(int(pitch.findtext('octave') or 4)+1)+PITCH.get(pitch.findtext('step') or 'C',0)+int(pitch.findtext('alter') or 0)
                        n['midi']=midi
                        n['lyric']=' '.join((v.findtext('text') or '').strip() for v in el.findall('lyric')).strip()
                        (right if staff==1 else left).append(n)
                if not chord:last_start=position;position+=duration;max_position=max(max_position,position)
        q=max_position/div if max_position else beats*4/beat_type
        info.append({'index':i,'startQuarter':round(cursor,5),'durationQuarter':round(q,5)})
        cursor+=q
    return {'beats':beats,'beatType':beat_type,'totalQuarters':round(cursor,5),'rawRightNotes':right,
            'rawLeftNotes':left,'rawRests':rests,'measuresInfo':info}

def main():
    if len(sys.argv)>1 and sys.argv[1]=='--json':
        print(json.dumps(timeline(SONGS/sys.argv[2]),ensure_ascii=False))
        return
    files=[p for p in SONGS.rglob('*') if p.suffix.lower() in ('.mxl','.musicxml','.xml')]
    assert files,'No MusicXML/MXL songs found'
    for f in files:
        data=timeline(f)
        assert data['measuresInfo'] and data['rawRightNotes']+data['rawLeftNotes'],f
        print(f'{f.name}: {len(data["measuresInfo"])} ô nhịp, {len(data["rawRightNotes"])} RH, {len(data["rawLeftNotes"])} LH')
        if f.name=='viet-tiep-cau-chuyen-hoa-binh-ban-moi.mxl':
            assert len(data['measuresInfo'])==48
            last_start=data['measuresInfo'][-1]['startQuarter']
            assert not [n for n in data['rawRightNotes'] if n['startQuarter']>=last_start]
            assert len([n for n in data['rawLeftNotes'] if n['startQuarter']>=last_start])==8
    print('Kiểm tra cấu trúc bài nhạc: OK')
if __name__=='__main__':main()
