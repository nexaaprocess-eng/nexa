# One-off QA helper used for the final delivery: compares boundary frames of a spliced export with their source renders (PSNR).
# Run from output/episode-001/final/.
import subprocess, numpy as np, json, sys
FIN='hidden_ledger_episode_001_FINAL_1080p.mp4'
def frame(path, n, w=480, h=270):
    r=subprocess.run(['ffmpeg','-v','error','-i',path,'-vf',f"select=eq(n\\,{n}),scale={w}:{h}",'-vsync','0','-frames:v','1','-f','rawvideo','-pix_fmt','gray','-'],capture_output=True)
    return np.frombuffer(r.stdout,dtype=np.uint8).astype(np.float64)
def psnr(a,b):
    m=np.mean((a-b)**2); return 99.0 if m==0 else 10*np.log10(255**2/m)
# (global frame, source file, frame index in source)
checks=[]
for g,src,off in [(3204,'parts/master.mp4',0),(3205,'parts/patchA.mp4',-3205),(3300,'parts/patchA.mp4',-3205),(3301,'parts/master.mp4',0),
                  (8534,'parts/master.mp4',0),(8535,'parts/patchB.mp4',-8535),(8640,'parts/patchB.mp4',-8535),(8641,'parts/master.mp4',0),
                  (14231,'parts/master.mp4',0),(14232,'parts/patchC.mp4',-14232),(14300,'parts/patchC.mp4',-14232),(14301,'parts/master.mp4',0),
                  (15799,'parts/master.mp4',0),(15800,'parts/patchD.mp4',-15800),(15900,'parts/patchD.mp4',-15800),(15901,'parts/master.mp4',0),(17805,'parts/master.mp4',0)]:
    f=frame(FIN,g); s=frame(src,g+off)
    # also compare with neighbours to show an off-by-one would be detected
    sp=frame(src,g+off+1) if g<17805 else s
    checks.append({'frame':g,'source':src,'psnr_db':round(float(psnr(f,s)),1),'psnr_vs_next_source_frame':(round(float(psnr(f,sp)),1) if len(sp)==len(f) else None)})
    print(checks[-1])
json.dump(checks,open('/home/user/nexa/hidden-ledger/diagnostics/final_splice_check.json','w'),indent=1)
