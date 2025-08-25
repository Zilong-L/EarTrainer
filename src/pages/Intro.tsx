import { Link } from 'react-router-dom';

const MusicTrainer = (): JSX.Element => {
  return (
    <div className="bg-[#e5e9de] min-h-screen md:h-auto md:min-h-screen px-[2rem] pb-8">
      <div className="max-w-[960px] md:max-w-[1440px] mx-auto">
        {/* 顶层标题区域 */}
        <header>
          <div className="text-black md:ml-[2rem] text-[4rem] font-normal ">
            Music Trainer
          </div>
        </header>

        {/* 使用 grid 布局：左边 3/4，右边 1/4 */}
        <div className="grid grid-rows-[1fr_1fr_1fr] md:grid-rows-[1fr] md:grid-cols-[3fr_1fr] gap-8  max-w-screen mx-auto md:aspect-video">
          {/* 左侧主区域 - 点击跳转到 Degree Trainer */}
          <Link
            to="/ear-trainer/degree-trainer"
            className="relative w-full bg-[#f4bc64] rounded-[40px] overflow-hidden flex items-center"
          >
            {/* 内部内容容器 */}
            <div className="grid p-2 md:p-0 md:absolute inset-0 z-0 md:flex items-center md:justify-center md:align-center">
              <p
                className="row-start-1 flex-col md:absolute text-[#fafafa] font-normal leading-[125%] z-10 select-none text-[4rem] 
                md:text-[16rem] md:-translate-x-[7rem] md:-translate-y-[15rem]"
              >
                Degree
              </p>
              <p
                className="row-start-2 md:absolute text-[#fafafa] font-normal leading-[125%] z-10 select-none text-[4rem] 
                md:text-[16rem] md:translate-x-[8rem] md:translate-y-[5.5rem]"
              >
                Trainer
              </p>
              <picture className="col-start-2 row-span-2">
                <source srcSet="imgs/Landing/hearing.webp" type="image/webp" />
                <img
                  src="imgs/Landing/hearing.png"
                  alt="Main Illustration"
                  className="  w-[20rem] h-[20rem]  md:absolute md:top-[7%] md:left-1/2 md:-translate-x-1/2 z-20 object-contain  h-full
                md:w-[60.41%] md:h-[85.80%] ]
               "
                />
              </picture>
            </div>
          </Link>

          {/* 右侧区域：两个卡片 */}
          <div className="flex flex-col gap-8">
            {/* 上卡片 - 点击跳转到 Chord Color Trainer */}
            <Link
              to="/ear-trainer/chord-color-trainer"
              className="relative bg-[#89bee1] rounded-[40px] p-4 h-1/2 md:h-[44%] text-center flex flex-col justify-start items-center"
            >
              <picture>
                <source srcSet="imgs/Landing/dj.webp" type="image/webp" />
                <img
                  src="imgs/Landing/dj.png"
                  alt="DJ Monkey"
                  className="absolute h-full left-0 top-0  md:top-auto  md:left-1/2 md:translate-x-[-50%] md:h-auto md:w-4/5 md:-bottom-7"
                />
              </picture>
              <div
                className="text-black text-[2.5rem] font-normal  self-end   mr-[2rem] 
              md:self-center md:mr-0"
              >
                Chord Trainer
              </div>
              <div className="self-end mr-[2rem] text-black text-[1.5rem] font-normal ">
                learn to hear
              </div>
            </Link>

            {/* 下卡片 - 点击跳转到 Chord Trainer */}
            <Link
              to="/chord-trainer"
              className="relative bg-[#ee9457] rounded-[40px] h-1/2  md:h-[56%] p-4 text-center flex flex-col justify-start items-center"
            >
              <div
                className="text-black text-[2.5rem] font-normal  self-end mr-[2rem]
              md:self-center md:mr-0"
              >
                Chord Trainer
              </div>
              <div className="self-end mr-[2rem] text-black text-[1.5rem] font-normal ">
                learn to play
              </div>
              <picture className="">
                <source
                  srcSet="imgs/Landing/woman_playing.webp"
                  type="image/webp"
                />
                <img
                  src="imgs/Landing/woman_playing.png"
                  alt="Guitar Girl"
                  className="absolute h-full top-0 left-0 md:top-auto md:left-1/2 md:translate-x-[-50%] md:h-auto md:w-4/5 md:-bottom-5"
                />
              </picture>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicTrainer;
