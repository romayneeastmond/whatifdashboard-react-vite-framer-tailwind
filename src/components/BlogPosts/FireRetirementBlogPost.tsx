const body = `<div id="blog-article">
        <div class="quick-answer">
            <strong>Quick Answer:</strong> Your FIRE number is 25× your expected annual retirement expenses — the amount you need invested to safely withdraw 4% per year indefinitely. A household spending $50,000/year needs $1,250,000. How fast you get there depends on your savings rate: saving 50% of income can cut your working years to under 20 regardless of salary.
        </div>

        <h2 id="what-is-fire">What Is FIRE and Is It Actually Achievable?</h2>

        <p>FIRE stands for Financial Independence, Retire Early. At its core, it is a straightforward mathematical idea: accumulate enough invested assets that the passive returns from those assets cover your living expenses — forever. Once that threshold is crossed, work becomes optional.</p>

        <p>The movement gained mainstream traction because the math is accessible to anyone. You do not need a high income. You need a high savings rate. A household earning $60,000 that saves $30,000 per year is on the same FIRE timeline as a household earning $200,000 that saves $100,000. The ratio is what matters.</p>

        <h3 id="the-fire-number">The FIRE Number: Your 25× Target</h3>

        <p>The most widely cited FIRE benchmark comes from the Trinity Study, which found that a 4% annual withdrawal rate from a diversified portfolio had a near-perfect survival rate over 30-year periods. Inverting that: divide your expected annual expenses by 0.04 — or multiply by 25 — and you have your FIRE number.</p>

        <p>Annual expenses of $40,000 require $1,000,000. Annual expenses of $70,000 require $1,750,000. The <a href="/fire">FIRE / Retirement Calculator</a> lets you model this precisely: enter your current savings, monthly contributions, expected return, and target retirement expenses, and it projects exactly when you cross the threshold.</p>

        <h3 id="savings-rate">Why Savings Rate Beats Income</h3>

        <p>Most people focus on earning more. FIRE practitioners focus on the gap between earning and spending. A 10% savings rate pushes retirement out to the traditional 40-year timeline. A 50% savings rate compresses it to roughly 17 years. At 70%, you can reach financial independence in under 10 years — regardless of your starting salary.</p>

        <p>This relationship is non-linear. Each incremental increase in savings rate produces disproportionate gains in time-to-FIRE because you are simultaneously building wealth faster and reducing the target (since your expenses are lower). The <a href="/fire">FIRE / Retirement Calculator</a> makes this trade-off visible: slide your savings rate up and watch the retirement date move toward you in real time.</p>

        <h2 id="growing-the-portfolio">Making the Portfolio Work: Compound Growth</h2>

        <p>The vehicle for FIRE is almost always index fund investing. The goal is to capture market returns with minimal fees so that compound growth does the heavy lifting over the accumulation phase.</p>

        <p>The <a href="/investing">Wealth Growth Calculator</a> isolates this dynamic. Enter your current balance, monthly contribution, expected annual return, and time horizon — it shows the total portfolio value broken down between contributions and compound gains. For long timelines, the gains routinely dwarf the contributions by a factor of two or three to one. This is why the FIRE community treats early investing as non-negotiable: every year of delay is a year of compounding permanently lost.</p>

        <h3 id="sequence-of-returns">The Risk Nobody Talks About: Sequence of Returns</h3>

        <p>The 4% rule assumes average returns over time. But the order of returns matters enormously. A market crash in year one of retirement — before your portfolio has had time to recover — can permanently impair a withdrawal strategy that would have survived the same crash in year ten. This is called sequence-of-returns risk.</p>

        <p>The practical mitigations are a cash buffer (1–2 years of expenses in a high-interest savings account), a slightly more conservative withdrawal rate (3.25–3.5% for retirements longer than 30 years), and flexibility to reduce spending during downturns. The <a href="/fire">FIRE / Retirement Calculator</a> lets you stress-test different return scenarios so you can see how sensitive your target date is to market assumptions.</p>

        <h2 id="flavours-of-fire">Lean FIRE, Fat FIRE, and Barista FIRE</h2>

        <p>FIRE is not one-size-fits-all. Lean FIRE targets a minimal expense lifestyle — often $25,000–$40,000/year — requiring a portfolio of $625,000–$1,000,000. Fat FIRE targets $100,000+ annually, requiring $2.5M or more. Barista FIRE is a hybrid: retire from a demanding career, take on part-time or low-stress work that covers day-to-day expenses, and let the portfolio compound untouched until full FIRE is reached.</p>

        <p>Each flavour represents a different trade-off between time, lifestyle, and risk. The right approach depends on your cost of living, flexibility, and risk tolerance — all of which you can model directly in the <a href="/fire">FIRE / Retirement Calculator</a>.</p>

        <section class="blog-faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading">Frequently Asked Questions</h2>
            <dl>
                <dt>What is the FIRE number and how do I calculate it?</dt>
                <dd>Your FIRE number is 25 times your expected annual retirement expenses — derived from the 4% safe withdrawal rate established by the Trinity Study. If you plan to spend $50,000 per year in retirement, your FIRE number is $1,250,000. Use the FIRE / Retirement Calculator to factor in your current savings, monthly contributions, and expected investment return to project when you will hit that target.</dd>

                <dt>What savings rate do I need to retire early?</dt>
                <dd>A 10% savings rate corresponds to a roughly 40-year working career. A 25% savings rate gets you to FIRE in about 32 years. At 50%, you can reach financial independence in approximately 17 years. At 65–70%, under 10 years is achievable. The savings rate is the single biggest lever because it simultaneously reduces your FIRE number and accelerates portfolio growth.</dd>

                <dt>Is the 4% withdrawal rule safe for a 40- or 50-year retirement?</dt>
                <dd>The original Trinity Study modelled 30-year retirements. For longer retirements — typical for early retirees — many planners recommend a 3.25–3.5% withdrawal rate to account for sequence-of-returns risk and longevity. Maintaining some spending flexibility (reducing withdrawals in down markets) materially improves long-term survival rates regardless of the rate you choose.</dd>

                <dt>How does compound interest accelerate FIRE?</dt>
                <dd>Compound interest means your investment returns generate their own returns. A portfolio earning 7% annually doubles roughly every 10 years. For early retirees, this means that starting 5 years earlier can add hundreds of thousands of dollars to your final balance — not from extra contributions, but from the additional compounding time. The Wealth Growth Calculator shows this effect in detail.</dd>
            </dl>
        </section>
    </div>

<div class="blog-links">
    <h3>Try These Calculators</h3>
    <ul>
        <li><a href="/fire">FIRE / Retirement Calculator</a> — Find your FIRE number and project exactly when you can retire.</li>
        <li><a href="/investing">Wealth Growth Calculator</a> — Model compound growth across any time horizon and contribution level.</li>
        <li><a href="/goals">Goals Tracker</a> — Break your FIRE target into milestone savings goals.</li>
    </ul>
</div>`;

export default body;
